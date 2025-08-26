import { Blend, Additive, CoffeeType, StoreSetting } from '@/types/supabase';

type RoastLevel = 'light' | 'medium' | 'dark';

interface FixedCostItem {
    label: string;
    value: number;
}
type FixedCosts = FixedCostItem[];

interface PriceCalculationParams {
    blend: Blend;
    composition: any[] | undefined;
    coffeePrices: Record<string, CoffeeType> | undefined;
    additives: Additive[] | undefined;
    roast: RoastLevel;
    weight: string;
    selectedAdditiveIds: string[];
    methodProfitMargin: number;
    fixedCosts: FixedCosts | undefined;
}

export const calculateBlendPrice = ({
    blend,
    composition,
    coffeePrices,
    additives,
    roast,
    weight,
    selectedAdditiveIds,
    methodProfitMargin,
    fixedCosts,
}: PriceCalculationParams): {
    finalPrice: number;
    cogs: number;
    grossProfit: number;
    totalCoffeeCost: number;
    totalAdditivesCost: number;
    totalFixedCosts: number;
    coffeeComponentBreakdown: { name: string; percentage: number; cost: number }[];
} => {
    const weightGrams = parseInt(weight);
    
    // The fixedCosts prop will now be an array: { label: string, value: number }[]
    const totalFixedCosts = Array.isArray(fixedCosts)
        ? fixedCosts.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
        : 0;

    // --- Manual Price Override ---
    if (blend.manual_price && blend.manual_price > 0) {
        const baseCoffeeSellingPrice = blend.manual_price * (weightGrams / 250);
        
        let additivesSellingPrice = 0;
        if (additives) {
            for (const additiveId of selectedAdditiveIds) {
                const additive = additives.find(a => a.id === additiveId);
                if (additive) {
                    const weightMultiplier = weightGrams / 250.0;
                    additivesSellingPrice += additive.price_per_250g * weightMultiplier;
                }
            }
        }
        
        const finalPrice = baseCoffeeSellingPrice + additivesSellingPrice;
        const cogs = 0; // COGS is not directly calculated for manual price
        const grossProfit = finalPrice; // Assuming manual price is pure profit for simplicity here, or needs a different COGS calculation
        return {
            finalPrice: Math.ceil(finalPrice / 5) * 5,
            cogs: cogs,
            grossProfit: grossProfit,
            totalCoffeeCost: 0, // Not applicable for manual price
            totalAdditivesCost: 0, // Not applicable for manual price
            totalFixedCosts: 0, // Not applicable for manual price
            coffeeComponentBreakdown: []
        };
    }

    // --- Dynamic Price Calculation (Cost + Profit Margin) ---
    if (!composition || !coffeePrices) {
        return {
            finalPrice: 0, cogs: 0, grossProfit: 0,
            totalCoffeeCost: 0, totalAdditivesCost: 0, totalFixedCosts: 0,
            coffeeComponentBreakdown: []
        };
    }

    // 1. Calculate Coffee Cost
    let totalCoffeeCost = 0;
    const coffeeComponentBreakdown: { name: string; percentage: number; cost: number }[] = [];
    const isGreenCoffeeMethod = blend.method_id ? ['cold-infusion', 'boiling', 'hot-infusion'].includes(blend.method_id) : false;

    for (const comp of composition) {
        const priceData = coffeePrices[comp.coffee_type_code];

        if (priceData) {
            let coffeeComponentCostPerKg = 0;
            if (isGreenCoffeeMethod) {
                coffeeComponentCostPerKg = priceData.price_green_kg || 0;
            } else {
                const roastedPriceKey = `price_${roast}_kg` as keyof CoffeeType;
                coffeeComponentCostPerKg = priceData[roastedPriceKey] as number || 0;
            }

            const componentWeightKg = (weightGrams / 1000.0) * (comp.percentage / 100.0);
            const componentCost = coffeeComponentCostPerKg * componentWeightKg;
            totalCoffeeCost += componentCost;
            coffeeComponentBreakdown.push({
                name: priceData.name_ar,
                percentage: comp.percentage,
                cost: componentCost
            });
        }
    }

    // 2. Calculate Additives Cost and Selling Price
    let totalAdditivesCost = 0;
    let totalAdditivesSellingPrice = 0;
    if (additives) {
        for (const additiveId of selectedAdditiveIds) {
            const additive = additives.find(a => a.id === additiveId);
            if (additive) {
                const weightMultiplier = weightGrams / 250.0;
                totalAdditivesCost += (additive.cost_per_250g || 0) * weightMultiplier;
                totalAdditivesSellingPrice += (additive.price_per_250g || 0) * weightMultiplier;
            }
        }
    }

    // 3. Calculate Total Cost and Final Selling Price
    const coffeeCogs = totalCoffeeCost + totalFixedCosts;
    const coffeeSellingPrice = coffeeCogs * methodProfitMargin;
    
    const finalPrice = coffeeSellingPrice + totalAdditivesSellingPrice;
    const roundedFinalPrice = Math.ceil(finalPrice / 5) * 5;

    const cogs = coffeeCogs + totalAdditivesCost;
    const grossProfit = roundedFinalPrice - cogs;

    return {
        finalPrice: roundedFinalPrice,
        cogs: cogs,
        grossProfit: grossProfit,
        totalCoffeeCost: totalCoffeeCost,
        totalAdditivesCost: totalAdditivesCost,
        totalFixedCosts: totalFixedCosts,
        coffeeComponentBreakdown: coffeeComponentBreakdown
    };
};