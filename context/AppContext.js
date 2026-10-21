import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
} from 'react-native';

import {
  INVENTORY as INITIAL_INVENTORY,
  RAW_MATERIALS as INITIAL_RAW,
  USAGE_HISTORY as INITIAL_USAGE,
} from '../constants/dummyData';

const AppContext = createContext(null);

export function AppProvider({ children }) {

  /*
  =========================================================
  INVENTORY
  =========================================================
  Admin managed.

  reserve = warehouse/godown stock
  live    = sellable/counter stock
  =========================================================
  */

  const [inventory, setInventory] = useState(
    INITIAL_INVENTORY.map(item => ({
      ...item,
      reserve: Number(item.reserve || 0),
      live: Number(item.live || 0),
      min: Number(item.min || 0),
      mrp: Number(item.mrp || 0),
      gst: Number(item.gst || 0),
    }))
  );

  /*
  =========================================================
  RAW MATERIALS
  =========================================================
  Raw materials are ONLY for expenditure/usage.

  NO:
  - reserve
  - live
  - stock transfer
  - billing
  =========================================================
  */

  const [rawMaterials, setRawMaterials] = useState(
    INITIAL_RAW.map(item => ({
      id: item.id,
      name: item.name,
      unit: item.unit || 'Kg',
      unitCost: Number(
        item.unitCost ?? item.cost ?? 0
      ),
    }))
  );

  const [usageHistory, setUsageHistory] =
    useState(INITIAL_USAGE);

  /*
  =========================================================
  BILLING CART
  =========================================================
  */

  const [cart, setCart] = useState([]);

  /*
  =========================================================
  BILLS
  =========================================================
  */

  const [bills, setBills] = useState([]);

  /*
  =========================================================
  ADD INVENTORY TO CART
  =========================================================
  */

  const addToCart = item => {

    const liveStock = Number(item.live || 0);

    if (liveStock <= 0) {
      Alert.alert(
        'Out of Stock',
        `${item.name} has no live stock available.`
      );
      return;
    }

    setCart(previous => {

      const found = previous.find(
        x => String(x.id) === String(item.id)
      );

      if (found) {

        if (found.qty >= liveStock) {
          Alert.alert(
            'Stock Limit',
            `Only ${liveStock} ${item.unit} of ${item.name} is available.`
          );

          return previous;
        }

        return previous.map(x =>
          String(x.id) === String(item.id)
            ? {
                ...x,
                qty: x.qty + 1,
              }
            : x
        );
      }

      return [
        ...previous,
        {
          ...item,
          qty: 1,
        },
      ];
    });
  };

  /*
  =========================================================
  CHANGE CART QUANTITY
  =========================================================
  */

  const changeCartQty = (id, delta) => {

    const sourceItem = inventory.find(
      x => String(x.id) === String(id)
    );

    const maxLive = Number(
      sourceItem?.live || 0
    );

    setCart(previous =>
      previous
        .map(item => {

          if (
            String(item.id) !== String(id)
          ) {
            return item;
          }

          const nextQty = Math.max(
            0,
            Number(item.qty || 0) + Number(delta || 0)
          );

          if (nextQty > maxLive) {

            Alert.alert(
              'Stock Limit',
              `Only ${maxLive} ${item.unit} is available in live stock.`
            );

            return {
              ...item,
              qty: maxLive,
            };
          }

          return {
            ...item,
            qty: nextQty,
          };
        })
        .filter(item => item.qty > 0)
    );
  };

  /*
  =========================================================
  CLEAR CART
  =========================================================
  */

  const clearCart = () => {
    setCart([]);
  };

  /*
  =========================================================
  TRANSFER INVENTORY
  =========================================================

  Reserve Stock
        ↓
  Live Stock

  Total Stock NEVER changes.
  =========================================================
  */

  const transferInventory = (
    id,
    qty
  ) => {

    const quantity = Math.max(
      0,
      Number(qty) || 0
    );

    if (quantity <= 0) {
      return false;
    }

    let transferred = false;

    setInventory(previous =>
      previous.map(item => {

        if (
          String(item.id) !== String(id)
        ) {
          return item;
        }

        const reserve = Number(
          item.reserve || 0
        );

        const live = Number(
          item.live || 0
        );

        const actualQuantity = Math.min(
          quantity,
          reserve
        );

        if (actualQuantity <= 0) {
          return item;
        }

        transferred = true;

        return {
          ...item,

          reserve:
            reserve - actualQuantity,

          live:
            live + actualQuantity,
        };
      })
    );

    return transferred;
  };

  /*
  =========================================================
  ADD RAW MATERIALS
  =========================================================
  */

  const addRawMaterials = materials => {

    if (
      !Array.isArray(materials) ||
      materials.length === 0
    ) {
      return;
    }

    const timestamp = Date.now();

    const newMaterials = materials
      .filter(
        item =>
          item &&
          String(item.name || '').trim()
      )
      .map((item, index) => ({
        id:
          `R${timestamp}_${index}`,

        name:
          String(item.name).trim(),

        unit:
          item.unit || 'Kg',

        unitCost:
          Number(item.unitCost || 0),
      }));

    if (!newMaterials.length) {
      return;
    }

    setRawMaterials(previous => [
      ...previous,
      ...newMaterials,
    ]);
  };

  /*
  =========================================================
  SINGLE RAW MATERIAL COMPATIBILITY
  =========================================================
  */

  const addRawMaterial = item => {

    addRawMaterials([
      item,
    ]);
  };

  /*
  =========================================================
  RAW MATERIAL USAGE
  =========================================================
  */

  const addRawMaterialUsage = ({
    materialId,
    qty,
    type = 'Given to Cook',
    remarks = '',
    date,
  }) => {

    const quantity =
      Number(qty) || 0;

    if (quantity <= 0) {
      Alert.alert(
        'Enter Quantity',
        'Usage quantity must be greater than zero.'
      );

      return false;
    }

    const material =
      rawMaterials.find(
        x =>
          String(x.id) ===
          String(materialId)
      );

    if (!material) {
      Alert.alert(
        'Material Not Found',
        'Please select a valid raw material.'
      );

      return false;
    }

    const unitCost =
      Number(material.unitCost || 0);

    const totalCost =
      quantity * unitCost;

    const now =
      new Date();

    const usageDate =
      date ||
      now.toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );

    const time =
      now.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );

    const newUsage = {

      id:
        `U${Date.now()}`,

      materialId:
        material.id,

      material:
        material.name,

      qty:
        quantity,

      unit:
        material.unit,

      type,

      date:
        usageDate,

      time,

      remarks,

      unitCost,

      cost:
        totalCost,
    };

    setUsageHistory(previous => [
      newUsage,
      ...previous,
    ]);

    return true;
  };

  /*
  =========================================================
  OLD SCREEN COMPATIBILITY
  =========================================================
  */

  const useRawMaterial = (
    id,
    qty,
    type = 'Given to Cook',
    remarks = ''
  ) => {

    return addRawMaterialUsage({
      materialId: id,
      qty,
      type,
      remarks,
    });
  };

  /*
  =========================================================
  FINALIZE BILL
  =========================================================

  IMPORTANT:

  Billing uses ONLY inventory.

  When bill is generated:

  Live Stock
       ↓
  Reduced by billed quantity
  =========================================================
  */

  const finalizeBill = bill => {

    if (!bill) {
      return {
        success: false,
        message: 'Invalid bill.',
      };
    }

    if (!cart.length) {
      return {
        success: false,
        message: 'Cart is empty.',
      };
    }

    /*
    ---------------------------------------------
    VERIFY LIVE STOCK BEFORE GENERATING
    ---------------------------------------------
    */

    for (const cartItem of cart) {

      const inventoryItem =
        inventory.find(
          x =>
            String(x.id) ===
            String(cartItem.id)
        );

      if (!inventoryItem) {
        return {
          success: false,
          message:
            `${cartItem.name} is no longer available.`,
        };
      }

      if (
        Number(cartItem.qty) >
        Number(inventoryItem.live)
      ) {
        return {
          success: false,
          message:
            `Only ${inventoryItem.live} ${inventoryItem.unit} of ${inventoryItem.name} is available.`,
        };
      }
    }

    /*
    ---------------------------------------------
    REDUCE LIVE STOCK
    ---------------------------------------------
    */

    setInventory(previous =>
      previous.map(item => {

        const cartItem =
          cart.find(
            x =>
              String(x.id) ===
              String(item.id)
          );

        if (!cartItem) {
          return item;
        }

        return {
          ...item,

          live:
            Math.max(
              0,
              Number(item.live || 0) -
              Number(cartItem.qty || 0)
            ),
        };
      })
    );

    /*
    ---------------------------------------------
    SAVE BILL
    ---------------------------------------------
    */

    const billNumber =
      `B${String(
        bills.length + 1
      ).padStart(4, '0')}`;

    const savedBill = {

      ...bill,

      id:
        billNumber,

      billNo:
        billNumber,

      items:
        cart.map(item => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          mrp: item.mrp,
          gst: item.gst,
          unit: item.unit,
        })),

      createdAt:
        new Date().toISOString(),
    };

    setBills(previous => [
      savedBill,
      ...previous,
    ]);

    setCart([]);

    return {
      success: true,
      bill: savedBill,
    };
  };

  /*
  =========================================================
  OLD ADD BILL COMPATIBILITY
  =========================================================
  */

  const addBill = bill => {
    setBills(previous => [
      {
        ...bill,
        id:
          `B${Date.now()}`,
      },
      ...previous,
    ]);
  };

  /*
  =========================================================
  TOTALS
  =========================================================
  */

  const totals = useMemo(() => {

    const inventoryLive =
      inventory.reduce(
        (sum, item) =>
          sum +
          Number(item.live || 0),
        0
      );

    const inventoryReserve =
      inventory.reduce(
        (sum, item) =>
          sum +
          Number(item.reserve || 0),
        0
      );

    const lowInventory =
      inventory.filter(
        item =>
          Number(item.live || 0) <=
          Number(item.min || 0)
      ).length;

    const outOfStock =
      inventory.filter(
        item =>
          Number(item.live || 0) === 0
      ).length;

    const totalInventoryUnits =
      inventory.reduce(
        (sum, item) =>
          sum +
          Number(item.live || 0) +
          Number(item.reserve || 0),
        0
      );

    const rawMaterialCount =
      rawMaterials.length;

    const usageCount =
      usageHistory.length;

    const usageCost =
      usageHistory.reduce(
        (sum, item) =>
          sum +
          Number(item.cost || 0),
        0
      );

    const cookUsageCost =
      usageHistory
        .filter(
          item =>
            item.type ===
            'Given to Cook'
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(item.cost || 0),
          0
        );

    const wasteCost =
      usageHistory
        .filter(
          item =>
            item.type ===
            'Damage / Waste'
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(item.cost || 0),
          0
        );

    const today =
      new Date()
        .toLocaleDateString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }
        );

    const todayUsage =
      usageHistory.filter(
        item =>
          item.date === today
      );

    const todayExpense =
      todayUsage.reduce(
        (sum, item) =>
          sum +
          Number(item.cost || 0),
        0
      );

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

      todayUsageCount:
        todayUsage.length,

      todayExpense,
    };

  }, [
    inventory,
    rawMaterials,
    usageHistory,
  ]);

  return (
    <AppContext.Provider
      value={{

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

export const useApp = () =>
  useContext(AppContext);