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
        .filter((p) => p.type === 'inventory' || !p.type)
        .map((p) => ({
          ...p,
          live: Number(p.quantity),
          reserve: 0,
          min: Number(p.thresholdQuantity),
          mrp: Number(p.price),
          gst: Number(p.IGST || 0) + Number(p.SGST || 0) + Number(p.CGST || 0),
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
        .filter((p) => p.type === 'raw_material')
        .map((p) => ({
          ...p,
          unitCost: Number(p.costPrice || p.price || 0),
          unit: p.units || 'Kg',
        }));
      setRawMaterials(mappedRaw);

      // 3. Fetch Recent Bills (Sales)
      const billsRes = await getAllSales({ outletId: storedUser.id, limit: 20 });
      setBills(billsRes.data || []);

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
  const transferInventory = async (id, qty) => {
    const quantity = Math.max(0, Number(qty) || 0);
    if (quantity <= 0 || !user?.id) return false;

    try {
      await updateStock(id, quantity, 'increment');
      
      setInventory((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? { ...item, live: item.live + quantity }
            : item
        )
      );
      return true;
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
      await updateStock(material.id, quantity, 'decrement');

      setRawMaterials((prev) =>
        prev.map((m) =>
          String(m.id) === String(materialId)
            ? { ...m, quantity: Math.max(0, m.quantity - quantity) }
            : m
        )
      );

      const totalCost = quantity * Number(material.unitCost || 0);
      const now = new Date();
      const newUsage = {
        id: `U${Date.now()}`,
        materialId: material.id,
        material: material.name,
        qty: quantity,
        unit: material.unit,
        type,
        date: date || now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks,
        unitCost: material.unitCost,
        cost: totalCost,
      };

      setUsageHistory((prev) => [newUsage, ...prev]);
      return true;
    } catch (error) {
      Alert.alert('Usage Failed', error.message);
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
      const salePayload = {
        outletId: user.id,
        state: user.address || 'Default State',
        customerName: billData.customerName || 'Walk-in Customer',
        createdBy: user.id,
        discount: billData.discount || 0,
        items: cart.map((c) => ({
          outletProductId: c.id,
          quantity: c.qty,
          unitPrice: c.mrp,
        })),
      };

      const createRes = await createSale(salePayload);

      if (createRes?.data?.id) {
        await approveSale(createRes.data.id, user.id);
      }

      const savedBill = {
        ...billData,
        id: createRes.data.invoiceNumber || `B${Date.now()}`,
        billNo: createRes.data.invoiceNumber,
        items: cart.map((item) => ({ ...item })),
        createdAt: new Date().toISOString(),
      };

      setBills((prev) => [savedBill, ...prev]);
      setCart([]);
      fetchData();

      return { success: true, bill: savedBill };
    } catch (error) {
      Alert.alert('Billing Failed', error.response?.data?.message || error.message);
      return { success: false, message: error.message };
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
        totals,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);