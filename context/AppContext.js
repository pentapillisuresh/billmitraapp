import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Alert } from 'react-native';

import { getUser } from '../utils/storage';
import { getAllProducts, updateStock } from '../service/outletProductService';
import { createSale, approveSale, getAllSales } from '../service/saleService';
import { createRawMaterialUsage, getRawMaterialUsages } from '../service/rawMaterialUsageService';
import { createStockRequest, getAllStockRequests } from '../service/stockRequestService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // Removed TypeScript generic
  const [loading, setLoading] = useState(true);

  // =========================================================
  // INVENTORY & RAW MATERIALS
  // =========================================================
  const [inventory, setInventory] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [bills, setBills] = useState([]);
  const [stockRequests, setStockRequests] = useState([]);

  // =========================================================
  // FETCH INITIAL DATA
  // =========================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const storedUser = await getUser();
      setUser(storedUser);

      if (!storedUser?.id) return;

      // 1. Fetch Inventory (type: 'inventory')
      const invRes = await getAllProducts({
        outletId: storedUser.id,
        isActive: true,
        limit: 100,
      });

      const mappedInventory = invRes.data
        .filter((p) => p.productType === 'inventory' || !p.productType)
        .map((p) => ({
          ...p,
          quantity: Number(p.quantity),
          live: Number(p.liveStock),
          reserve: Number(p.reservedStock),
          min: Number(p.thresholdQuantity),
          mrp: Number(p.price),
          gst: Number(p.SGST || 0) + Number(p.CGST || 0),
          unit: p.units || 'Pc',
        }));
      setInventory(mappedInventory);

      // 2. Fetch Raw Materials (type: 'raw_material')
      const rawRes = await getAllProducts({
        outletId: storedUser.id,
        isActive: true,
        limit: 100,
      });
      const mappedRaw = rawRes.data
        .filter((p) => p.productType === 'raw_material')
        .map((p) => ({
          ...p,
          unitCost: Number(p.costPrice || p.price || 0),
          unit: p.units || 'Kg',
        }));
      setRawMaterials(mappedRaw);

      // 3. Fetch Recent Bills (Sales)
      const billsRes = await getAllSales({ outletId: storedUser.id, limit: 20 });
      setBills(billsRes.data || []);

      // 🆕 3. Fetch Raw Material Usage History
      const usageRes = await getRawMaterialUsages({
        outletId: storedUser.id,
        limit: 50 // Fetch last 50 records for the dashboard/history
      });
      // Map backend data to match frontend UI expectations
      const mappedUsage = (usageRes.data || []).map((u) => {
        const dateObj = new Date(u.date);

        return {
          id: u.id,
          materialId: u.outletProductId,
          material: u.rawMaterial?.name || 'Unknown Material',
          qty: Number(u.quantityUsed),
          unit: u.unit || u.rawMaterial?.units || 'Unit',
          type: u.usageType,
          date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          remarks: u.remarks || '',
          unitCost: Number(u.costAtTimeOfUsage) / Number(u.quantityUsed) || 0,
          cost: Number(u.costAtTimeOfUsage || 0),
        };
      });

      setUsageHistory(mappedUsage);
      // 🆕 4. Fetch Outlet's Stock Requests
      const stockReqRes = await getAllStockRequests({
        outletId: storedUser.id,
        limit: 50
      });
      setStockRequests(stockReqRes.data || []);

    } catch (error) {
      console.error('Failed to load context data:', error);
      Alert.alert('Error', 'Failed to load inventory data from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

  }, [fetchData]);

  // =========================================================
  // 🆕 ADD NEW STOCK REQUEST (By Outlet)
  // =========================================================
  const addStockRequest = async ({ requestType = 'refill', notes, items }) => {
    if (!items || items.length === 0) {
      Alert.alert('Error', 'Please add at least one item to request.');
      return false;
    }

    try {
      const storedUser = await getUser();
      if (!storedUser?.id) {
        Alert.alert('Error', 'User session expired.');
        return false;
      }

      // Format payload to match backend controller
      const payload = {
        outletId: storedUser.id,
        requestType,
        notes,
        requestedBy: storedUser.id,
        items: items.map(i => ({
          outletProductId: i.outletProductId || null,
          productName: i.productName,
          requestedQuantity: i.requestedQuantity,
        }))
      };

      // Call API
      await createStockRequest(payload);
      
      // Refresh to get updated list
      await fetchData(); 
      
      return true;
    } catch (error) {
      console.error('Create Stock Request Error:', error);
      Alert.alert('Request Failed', error.response?.data?.message || error.message);
      return false;
    }
  };

  // =========================================================
  // BILLING CART
  // =========================================================
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    const liveStock = Number(item.live || 0);

    if (liveStock <= 0) {
      Alert.alert('Out of Stock', `${item.name} has no live stock available.`);
      return;
    }

    setCart((previous) => {
      const found = previous.find((x) => String(x.id) === String(item.id));
      if (found) {
        if (found.qty >= liveStock) {
          Alert.alert('Stock Limit', `Only ${liveStock} ${item.unit} of ${item.name} is available.`);
          return previous;
        }
        return previous.map((x) =>
          String(x.id) === String(item.id) ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...previous, { ...item, qty: 1 }];
    });
  };

  const changeCartQty = (id, delta) => {
    const sourceItem = inventory.find((x) => String(x.id) === String(id));
    const maxLive = Number(sourceItem?.live || 0);

    setCart((previous) =>
      previous
        .map((item) => {
          if (String(item.id) !== String(id)) return item;

          const nextQty = Math.max(0, Number(item.qty || 0) + Number(delta || 0));

          if (nextQty > maxLive) {
            Alert.alert('Stock Limit', `Only ${maxLive} ${item.unit} is available in live stock.`);
            return { ...item, qty: maxLive };
          }
          return { ...item, qty: nextQty };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const clearCart = () => setCart([]);

  // =========================================================
  // TRANSFER INVENTORY
  // =========================================================
  const transferInventory = async (id, live, reserve) => {

    try {
      await updateStock(id, live, reserve);

      setInventory((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? { ...item, live: item.live + live }
            : item
        )
      );
      return false;
    } catch (error) {
      Alert.alert('Transfer Failed', error.message);
      return false;
    }
  };

  // =========================================================
  // ADD RAW MATERIALS
  // =========================================================
  const addRawMaterials = (materials) => {
    if (!Array.isArray(materials) || materials.length === 0) return;
    const newMaterials = materials.map((m, i) => ({
      id: `R${Date.now()}_${i}`,
      name: m.name,
      unit: m.unit || 'Kg',
      unitCost: Number(m.unitCost || 0),
    }));
    setRawMaterials((prev) => [...prev, ...newMaterials]);
  };

  const addRawMaterial = (item) => addRawMaterials([item]);

  // =========================================================
  // RAW MATERIAL USAGE
  // =========================================================
  const addRawMaterialUsage = async ({ materialId, qty, type = 'Given to Cook', remarks = '', date }) => {
    const quantity = Number(qty) || 0;

    // 1. Basic Validation
    if (quantity <= 0) {
      Alert.alert('Enter Quantity', 'Usage quantity must be greater than zero.');
      return false;
    }

    const material = rawMaterials.find((x) => String(x.id) === String(materialId));
    if (!material) {
      Alert.alert('Material Not Found', 'Please select a valid raw material.');
      return false;
    }

    try {
      const user = await getUser();
      if (!user?.id) {
        Alert.alert('Error', 'User session expired. Please log in again.');
        return false;
      }

      // 2. Call the new backend API 
      // (Backend handles the check, transaction, and stock deduction)
      const rawMaterialUsage = {
        outletProductId: material.id,
        quantityUsed: quantity,
        usageType: type,
        remarks: remarks,
        date: date || new Date(),
        outletId: user.id,
        createdBy: user.id,
      };
      createRawMaterialUsage(rawMaterialUsage);
      await fetchData();

      // 3. Update local rawMaterials state (optimistic UI update)
      // Deduct from both 'quantity' and 'liveStock' in local state
      // setRawMaterials((prev) =>
      //   prev.map((m) =>
      //     String(m.id) === String(materialId)
      //       ? {
      //         ...m,
      //         quantity: Math.max(0, (Number(m.quantity) || 0) - quantity),
      //         liveStock: Math.max(0, (Number(m.liveStock) || 0) - quantity)
      //       }
      //       : m
      //   )
      // );

      // // 4. Add to local usageHistory for immediate UI update
      // const unitCost = Number(material.unitCost || material.costPrice || 0);
      // const totalCost = quantity * unitCost;
      // const now = new Date();

      // const newUsage = {
      //   id: `U${Date.now()}`, // Temporary local ID for UI key
      //   materialId: material.id,
      //   material: material.name,
      //   qty: quantity,
      //   unit: material.unit || material.units || 'Unit',
      //   type,
      //   date: date || now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      //   time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      //   remarks,
      //   unitCost: unitCost,
      //   cost: totalCost,
      // };

      // setUsageHistory((prev) => [newUsage, ...prev]);

      return true;
    } catch (error) {
      // The backend will return an error message if stock is insufficient
      console.error("Usage Error:", error);
      Alert.alert('Usage Failed', error.response?.data?.message || error.message);
      return false;
    }
  };

  const useRawMaterial = (id, qty, type, remarks) => {
    return addRawMaterialUsage({ materialId: id, qty, type, remarks });
  };

  // =========================================================
  // FINALIZE BILL
  // =========================================================

  const finalizeBill = async (billData) => {
    if (!cart.length) return { success: false, message: 'Cart is empty.' };
    if (!user?.id) return { success: false, message: 'User not logged in.' };

    try {
      // Build payload matching backend Sale model requirements
      const salePayload = {
        outletId: user.id,
        state: billData.state || user.address || 'Default State',
        customerName: billData.customerName || 'Walk-in Customer',
        customerPhone: billData.customerPhone || '',
        customerAddress: billData.customerAddress || '',
        createdBy: user.id,
        discount: Number(billData.discountValue) || 0, // Backend needs absolute discount amount
        items: cart.map((c) => ({
          outletProductId: c.id,
          quantity: c.qty,
          unitPrice: c.mrp, // Unit price is sent, backend calculates subtotal/tax
        })),
      };

      // 1. Create the Sale
      const createRes = await createSale(salePayload);

      // 2. Auto-Approve the Sale to deduct stock
      if (createRes?.data?.id) {
        await approveSale(createRes.data.id, user.id);
      }

      // 3. Construct local bill object for UI receipt
      const savedBill = {
        ...billData,
        id: createRes.data.invoiceNumber || `B${Date.now()}`,
        billNo: createRes.data.invoiceNumber,
        items: cart.map((item) => ({ ...item })),
        createdAt: new Date().toISOString(),
      };

      // 4. Update local state
      setBills((prev) => [savedBill, ...prev]);
      setCart([]);

      // 5. Refresh inventory to get updated stock from backend
      fetchData();

      return { success: true, bill: savedBill };
    } catch (error) {
      console.error('Billing failed:', error);
      Alert.alert('Billing Failed', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const addBill = (bill) => setBills((prev) => [{ ...bill, id: `B${Date.now()}` }, ...prev]);

  // =========================================================
  // TOTALS
  // =========================================================
  const totals = useMemo(() => {
    const inventoryLive = inventory.reduce((sum, item) => sum + Number(item.live || 0), 0);
    const inventoryReserve = inventory.reduce((sum, item) => sum + Number(item.reserve || 0), 0);
    const lowInventory = inventory.filter((item) => Number(item.live || 0) <= Number(item.min || 0) && Number(item.live || 0) > 0).length;
    const outOfStock = inventory.filter((item) => Number(item.live || 0) === 0).length;
    const totalInventoryUnits = inventoryLive + inventoryReserve;

    const rawMaterialCount = rawMaterials.length;
    const usageCount = usageHistory.length;
    const usageCost = usageHistory.reduce((sum, item) => sum + Number(item.cost || 0), 0);
    const cookUsageCost = usageHistory.filter((i) => i.type === 'Given to Cook').reduce((sum, i) => sum + Number(i.cost || 0), 0);
    const wasteCost = usageHistory.filter((i) => i.type === 'Damage / Waste').reduce((sum, i) => sum + Number(i.cost || 0), 0);

    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const todayUsage = usageHistory.filter((item) => item.date === today);
    const todayExpense = todayUsage.reduce((sum, item) => sum + Number(item.cost || 0), 0);

    return {
      inventoryLive,
      inventoryReserve,
      totalInventoryUnits,
      lowInventory,
      outOfStock,
      rawMaterialCount,
      usageCount,
      usageCost,
      cookUsageCost,
      wasteCost,
      todayUsageCount: todayUsage.length,
      todayExpense,
    };
  }, [inventory, rawMaterials, usageHistory]);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        refreshData: fetchData,
        inventory,
        setInventory,
        transferInventory,
        rawMaterials,
        setRawMaterials,
        addRawMaterial,
        addRawMaterials,
        usageHistory,
        setUsageHistory,
        addRawMaterialUsage,
        useRawMaterial,
        cart,
        bills,
        addToCart,
        changeCartQty,
        clearCart,
        addBill,
        finalizeBill,
        stockRequests,
        addStockRequest,
        totals,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);