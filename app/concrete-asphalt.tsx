import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Props interface for the DisplayRow component
type DisplayRowProps = {
  label: string;
  value: string;
  section?: 'concrete' | 'additionalInch' | 'driveway' | 'total';
  onChangeText?: (text: string) => void;
  isInputRow?: boolean;
  isCostRow?: boolean;
  isSelectionRow?: boolean;
  onlyAsphaltAdded?: string;
  setOnlyAsphaltAdded?: (value: string) => void;
};

// Memoized DisplayRow component
const DisplayRow = React.memo(({
  label,
  value,
  section,
  onChangeText,
  isInputRow,
  isCostRow,
  isSelectionRow,
  onlyAsphaltAdded,
  setOnlyAsphaltAdded
}: DisplayRowProps) => {
  const shouldShowDollarSign = label.toLowerCase().includes('price') || 
                            label.toLowerCase().includes('cost') || 
                            label.toLowerCase().includes('fee') || 
                            label === 'Commission Amount';

  const getUnit = (label: string) => {
    if (label.includes('Thickness') || label.includes('Inches')) return ' inches';
    if (label.includes('Volume')) return ' cubic feet';
    if (label.includes('Area')) return ' square feet';
    if (label === 'Asphalt Tons' || label === 'Extra Asphalt (5%)' || label === 'Total Asphalt Tons' ||
        label === 'Base Tons' || label === 'Total Base Tons' ||
        label === 'Dirt Tons' || label === 'Extra Dirt (5%)' || label === 'Total Dirt Tons' || label === 'Extra Base (5%)') return ' tons';
    return '';
  };

  return (
    <View style={[
      styles.inputContainer,
      label === 'Total Cost' ? styles.totalRow : 
      isInputRow ? styles.rowEven :
      isCostRow ? styles.costRow :
      styles.rowOdd
    ]}>
      {isSelectionRow ? (
        <View style={styles.selectionRowContainer}>
          <ThemedText style={styles.subtitle}>{label}</ThemedText>
          <View style={styles.selectionContainer}>
            <Pressable
              style={[
                styles.selectionButton,
                onlyAsphaltAdded === 'Yes' && styles.selectionButtonSelected
              ]}
              onPress={() => setOnlyAsphaltAdded?.('Yes')}
            >
              <ThemedText style={[
                styles.selectionText,
                onlyAsphaltAdded === 'Yes' && styles.selectionTextSelected
              ]}>Yes</ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.selectionButton,
                onlyAsphaltAdded === 'No' && styles.selectionButtonSelected
              ]}
              onPress={() => setOnlyAsphaltAdded?.('No')}
            >
              <ThemedText style={[
                styles.selectionText,
                onlyAsphaltAdded === 'No' && styles.selectionTextSelected
              ]}>No</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.rowContent}>
          <ThemedText style={styles.subtitle}>{label}:</ThemedText>
          {isInputRow ? (
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[styles.input, styles.inputWithUnitSpacing]}
                value={label === 'Commission Amount' ? `$${value}` : value}
                onChangeText={(text) => {
                  if (label === 'Commission Amount') {
                    // Remove dollar sign and any non-numeric characters except decimal point
                    const numericValue = text.replace(/[^0-9.]/g, '');
                    onChangeText?.(numericValue);
                  } else {
                    onChangeText?.(text);
                  }
                }}
                placeholder={label === 'Commission Amount' ? 'Enter amount ($)' : `Enter ${label.toLowerCase()}`}
                keyboardType="numeric"
              />
              <View style={styles.unitContainer}>
                {label === 'Distance' && <ThemedText style={styles.unitLabel}>miles</ThemedText>}
                {label === 'Total Area' && <ThemedText style={styles.unitLabel}>square feet</ThemedText>}
                {label === 'Additional Inches' && <ThemedText style={styles.unitLabel}>inches</ThemedText>}
                {(label === 'Additional Asphalt' || label === 'Additional Base') && <ThemedText style={styles.unitLabel}>tons</ThemedText>}
              </View>
            </View>
          ) : (
            <ThemedText style={styles.value}>
              {shouldShowDollarSign ? '$' : ''}{value}{getUnit(label)}
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
});

export default function ConcreteAsphaltScreen() {
  // Add ScrollView reference
  const scrollViewRef = useRef<ScrollView>(null);

  // Add state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    concrete: false,
    additionalInch: false,
    driveway: false
  });

  // Function to reset all inputs
  const handleNewQuote = () => {
    // Reset all input states
    setConcreteArea('');
    setConcreteAdditional('');
    setDistance('');
    setAdditionalInchArea('');
    setAdditionalInchAsphalt('');
    setDrivewayArea('');
    setDrivewayAdditionalAsphalt('');
    setDrivewayAdditionalBase('');
    setOnlyAsphaltAdded('No');
    setCommissionAmount('');

    // Scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Function to toggle section expansion
  const toggleSection = (section: 'concrete' | 'additionalInch' | 'driveway') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Section Title component with toggle button
  const SectionTitle = ({ title, section }: { title: string, section: 'concrete' | 'additionalInch' | 'driveway' }) => (
    <View style={styles.sectionTitleContainer}>
      <ThemedText style={styles.sectionTitleText}>{title}</ThemedText>
      <View style={styles.toggleButtonContainer}>
        <Pressable
          onPress={() => toggleSection(section)}
          style={styles.toggleButton}
        >
          <ThemedText style={styles.toggleButtonText}>
            {expandedSections[section] ? 'Show Less' : 'Show More'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );

  // State for user input fields
  const [concreteArea, setConcreteArea] = useState('');           // Total area in square feet
  const [concreteAdditional, setConcreteAdditional] = useState('');  // Additional asphalt in tons
  const [concreteAdditionalBase, setConcreteAdditionalBase] = useState(''); // Additional base in tons
  const [distance, setDistance] = useState('');             // Distance in miles
  
  // Additional Inch section inputs
  const [additionalInchArea, setAdditionalInchArea] = useState('');           // Total area in square feet
  const [additionalInchAsphalt, setAdditionalInchAsphalt] = useState('');     // Additional asphalt in tons
  const [additionalInchThickness, setAdditionalInchThickness] = useState(''); // Additional asphalt thickness
  
  // Driveway inputs
  const [drivewayArea, setDrivewayArea] = useState('');    // Driveway area in square feet
  const [drivewayAdditionalAsphalt, setDrivewayAdditionalAsphalt] = useState(''); // Additional asphalt for driveway
  const [drivewayAdditionalBase, setDrivewayAdditionalBase] = useState(''); // Additional base for driveway
  const [onlyAsphaltAdded, setOnlyAsphaltAdded] = useState('No'); // Whether only asphalt is added to driveway

  // Total Cost section inputs
  const [commissionAmount, setCommissionAmount] = useState(''); // Commission amount

  // Modal state
  const [isDefaultValuesModalVisible, setIsDefaultValuesModalVisible] = useState(false);
  const [tempDefaultValues, setTempDefaultValues] = useState({
    pricePerTon: '100',
    truckingInCostPerTon: '10',
    truckingOutCostPerTon: '15',
    removalLaborCostPerTon: '38',
    basePricePerTon: '17',
    baseLaborCostPerTon: '15'
  });

  // Function to save default values to AsyncStorage
  const saveDefaultValues = async (values: typeof tempDefaultValues) => {
    try {
      await AsyncStorage.setItem('concreteAsphaltDefaults', JSON.stringify(values));
    } catch (error) {
      console.error('Error saving default values:', error);
    }
  };

  // Function to load default values from AsyncStorage
  const loadDefaultValues = async () => {
    try {
      const savedValues = await AsyncStorage.getItem('concreteAsphaltDefaults');
      if (savedValues) {
        const parsedValues = JSON.parse(savedValues);
        setCalculatedValues(prev => ({
          ...prev,
          pricePerTon: parsedValues.pricePerTon,
          truckingInCostPerTon: parsedValues.truckingInCostPerTon,
          truckingOutCostPerTon: parsedValues.truckingOutCostPerTon,
          removalLaborCostPerTon: parsedValues.removalLaborCostPerTon,
          basePricePerTon: parsedValues.basePricePerTon,
          baseLaborCostPerTon: parsedValues.baseLaborCostPerTon
        }));
      }
    } catch (error) {
      console.error('Error loading default values:', error);
    }
  };

  // Load default values when component mounts
  useEffect(() => {
    loadDefaultValues();
  }, []);

  // Function to save default values
  const handleSaveDefaultValues = async () => {
    // Save to state
    setCalculatedValues(prev => ({
      ...prev,
      pricePerTon: tempDefaultValues.pricePerTon,
      truckingInCostPerTon: tempDefaultValues.truckingInCostPerTon,
      truckingOutCostPerTon: tempDefaultValues.truckingOutCostPerTon,
      removalLaborCostPerTon: tempDefaultValues.removalLaborCostPerTon,
      basePricePerTon: tempDefaultValues.basePricePerTon,
      baseLaborCostPerTon: tempDefaultValues.baseLaborCostPerTon
    }));

    // Save to AsyncStorage
    await saveDefaultValues(tempDefaultValues);
    
    setIsDefaultValuesModalVisible(false);
  };

  // Calculated values state
  const [calculatedValues, setCalculatedValues] = useState({
    // Driveway Widening Add On values
    drivewayAsphaltThickness: '3',     // Default thickness in inches
    drivewayAsphaltVolume: '0',        // Volume in cubic feet
    drivewayAsphaltTons: '0',          // Base tonnage before waste
    drivewayExtraAsphalt: '0',         // Additional 5% for waste
    drivewayTotalAsphaltTons: '0',     // Total tonnage including waste
    drivewayAsphaltCost: '0',          // Total material cost
    drivewayLaborCostPerTon: '0',      // Labor cost per ton (varies by area)
    drivewayLaborCost: '0',            // Installation labor cost
    drivewayTruckingInCost: '0',       // Total delivery cost

    // Driveway Base values
    drivewayBaseThickness: '6',        // Default thickness in inches
    drivewayBaseVolume: '0',           // Volume in cubic feet
    drivewayBaseTons: '0',             // Base tonnage before waste
    drivewayExtraBase: '0',            // Additional 5% for waste
    drivewayTotalBaseTons: '0',        // Total tonnage including waste
    drivewayBaseCost: '0',             // Total material cost
    drivewayBaseLaborCost: '0',        // Total labor cost
    drivewayBaseTruckingInCost: '0',   // Total delivery cost

    // Driveway Dirt values
    drivewayDirtThickness: '9',        // Default thickness in inches
    drivewayDirtVolume: '0',           // Volume in cubic feet
    drivewayDirtTons: '0',             // Base tonnage before waste
    drivewayExtraDirt: '0',            // Additional 5% for waste
    drivewayTotalDirtTons: '0',        // Total tonnage including waste
    drivewayDirtTruckingOutCost: '0',  // Total removal transport cost
    drivewayDirtOutLaborCost: '0',     // Total removal labor cost
    drivewayAddedPortionMobilizationFee: '0', // Fee when only asphalt is added
    drivewayTotalCost: '0',            // Total cost for driveway section

    // Additional Inch values
    additionalInchVolume: '0',      // Volume in cubic feet
    additionalInchTons: '0',        // Base tonnage before waste
    additionalInchExtra: '0',       // Additional 5% for waste
    additionalInchTotalTons: '0',   // Total tonnage including waste
    additionalInchCost: '0',        // Total material cost
    additionalInchTruckingInCost: '0', // Total delivery cost
    additionalInchLaborCost: '0',   // Total installation labor
    additionalInchTotalCost: '0',   // Sum of all additional inch costs

    // Concrete Out Asphalt In values
    asphaltThickness: '3',          // Default thickness in inches
    asphaltVolume: '0',             // Volume in cubic feet
    asphaltTons: '0',               // Base tonnage before waste
    extraAsphalt: '0',              // Additional 5% for waste
    totalAsphaltTons: '0',          // Total tonnage including waste
    pricePerTon: '100',             // Base price per ton of asphalt
    asphaltCost: '0',               // Total material cost
    truckingInCostPerTon: '10',     // Cost per ton for delivery
    truckingInCost: '0',            // Total delivery cost
    laborCostPerTon: '0',           // Labor cost per ton (varies by area)
    installationLaborCost: '0',     // Installation labor cost
    pavingMobilizationCost: '0',    // Variable based on area size
    truckingOutCostPerTon: '15',    // Cost per ton for removal
    truckingOutCost: '0',           // Total removal transport cost
    removalLaborCostPerTon: '38',   // Labor cost per ton for removal
    removalLaborCost: '0',          // Total removal labor cost
    baseThickness: '6',             // Default thickness in inches
    baseVolume: '0',                // Volume in cubic feet
    baseTons: '0',                  // Base tonnage before waste
    extraBase: '0',                 // Additional 5% for waste
    totalBaseTons: '0',             // Total tonnage including waste
    basePricePerTon: '17',         // Base price per ton
    baseCost: '0',                 // Total material cost
    baseTruckingInCost: '0',       // Total delivery cost
    baseLaborCostPerTon: '15',     // Labor cost per ton
    baseLaborCost: '0',            // Total labor cost
    dirtTruckingOutCost: '0',      // Total removal transport cost
    dirtOutLaborCost: '0',         // Total removal labor cost
    flatRateMobilizationFee: '200', // Base mobilization fee
    installationMileageCost: '0',   // Additional cost for distance > 10 miles
    removalMileageCost: '0',        // Additional cost for distance > 10 miles
    concreteTotalCost: '0',         // Total cost for concrete section
  });

  // Function to render display rows
  const renderDisplayRow = React.useCallback((label: string, value: string, section: DisplayRowProps['section'], handler?: (text: string) => void) => {
         const isInputRow = label === 'Total Area' || 
                       label === 'Additional Asphalt' ||
                       label === 'Additional Base' ||
                       label === 'Distance' ||
                       label === 'Additional Inches' ||
                       label === 'Commission Amount';

    const isCostRow = [
      'Total Asphalt Tons',
      'Asphalt Cost',
      'Trucking In Cost',
      'Installation Labor Cost',
      'Paving Mobilization Cost',
      'Base Cost',
      'Base Trucking In Cost',
      'Base Labor Cost',
      'Dirt Trucking Out Cost',
      'Dirt Out Labor Cost',
      'Trucking Out Cost',
      'Removal Labor Cost',
      'Flat Rate Mobilization Fee',
      'Installation Mileage Cost',
      'Removal Mileage Cost',
      'Only Asphalt Portion Added to Driveway?',
      'Added Portion Mobilization Fee',
      'Total Cost',
    ].includes(label);

    const isSelectionRow = label === 'Only Asphalt Portion Added to Driveway?';

    return (
      <DisplayRow
        key={`${section}-${label}`}
        label={label}
        value={value}
        section={section}
        onChangeText={handler}
        isInputRow={isInputRow}
        isCostRow={isCostRow}
        isSelectionRow={isSelectionRow}
        onlyAsphaltAdded={onlyAsphaltAdded}
        setOnlyAsphaltAdded={setOnlyAsphaltAdded}
      />
    );
  }, []);

  // Helper function to determine if a row should be shown
  const shouldShowRow = (label: string, section: 'concrete' | 'additionalInch' | 'driveway' | 'total') => {
    if (section === 'total') return true;  // Always show total section rows
    const isExpanded = expandedSections[section];
    const isCostRow = [
      'Total Asphalt Tons',
      'Asphalt Cost',
      'Trucking In Cost',
      'Installation Labor Cost',
      'Paving Mobilization Cost',
      'Base Cost',
      'Base Trucking In Cost',
      'Base Labor Cost',
      'Dirt Trucking Out Cost',
      'Dirt Out Labor Cost',
      'Trucking Out Cost',
      'Removal Labor Cost',
      'Flat Rate Mobilization Fee',
      'Installation Mileage Cost',
      'Removal Mileage Cost',
      'Only Asphalt Portion Added to Driveway?',
      'Added Portion Mobilization Fee',
      'Total Cost',
    ].includes(label);
    
    const isInputRow = label === 'Total Area' || label === 'Distance' || label === 'Additional Inches';
    const isHiddenInput = label === 'Additional Asphalt' || label === 'Additional Base';
    const isSelectionRow = label === 'Only Asphalt Portion Added to Driveway?';
    
    // Always show cost rows, input rows, selection rows, and total cost, hide others when collapsed
    if (isHiddenInput) return isExpanded;
    return isExpanded || isCostRow || isInputRow || isSelectionRow || label === 'Total Cost';
  };

  // Effect hook to recalculate values when inputs change
  useEffect(() => {
    const calculateValues = () => {
      // Parse input values with fallback to 0
      const area = parseFloat(concreteArea) || 0;
      const thickness = parseFloat(calculatedValues.asphaltThickness) || 0;
      const additionalTons = parseFloat(concreteAdditional) || 0;
      const additionalBaseTons = parseFloat(concreteAdditionalBase) || 0;

      // Asphalt calculations
      const totalThicknessInFeet = thickness / 12;
      const volume = area * totalThicknessInFeet;
      const tons = (volume * 145) / 2000;
      const totalAsphaltTons = tons + additionalTons;
      const extraAsphalt = totalAsphaltTons * 0.05;
      const finalTotalTons = Math.ceil(totalAsphaltTons + extraAsphalt);

      const asphaltCost = finalTotalTons * parseFloat(calculatedValues.pricePerTon);
      const truckingInCost = finalTotalTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const laborCostPerTon = area <= 5000 ? 50 : 45;
      const installationLaborCost = finalTotalTons * laborCostPerTon;
      const truckingOutCost = finalTotalTons * parseFloat(calculatedValues.truckingOutCostPerTon);
      const removalLaborCost = finalTotalTons * parseFloat(calculatedValues.removalLaborCostPerTon);

      // Base calculations
      const baseThickness = parseFloat(calculatedValues.baseThickness) || 0;
      const baseThicknessInFeet = baseThickness / 12;
      const baseVolume = area * baseThicknessInFeet;
      const baseTons = (baseVolume * 100) / 2000;
      const totalBaseTons = baseTons + additionalBaseTons;
      const extraBase = totalBaseTons * 0.05;
      const finalBaseTons = Math.ceil(totalBaseTons + extraBase);

      const baseCost = finalBaseTons * parseFloat(calculatedValues.basePricePerTon);
      const baseTruckingInCost = finalBaseTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const baseLaborCost = finalBaseTons * parseFloat(calculatedValues.baseLaborCostPerTon);
      const dirtTruckingOutCost = finalBaseTons * parseFloat(calculatedValues.truckingOutCostPerTon);
      const dirtOutLaborCost = finalBaseTons * parseFloat(calculatedValues.removalLaborCostPerTon);

      // Mileage calculations
      const distanceValue = parseFloat(distance) || 0;
      const extraMiles = Math.max(0, distanceValue - 10);
      const installationMileageCost = extraMiles * 20;
      const removalMileageCost = extraMiles * 10;

      // Calculate paving mobilization cost based on area
      let pavingMobilizationCost;
      if (area <= 1000) {
        pavingMobilizationCost = 500;
      } else if (area <= 3000) {
        pavingMobilizationCost = 400;
      } else if (area <= 5000) {
        pavingMobilizationCost = 300;
      } else {
        pavingMobilizationCost = 200;
      }

      // Additional Inch calculations
      const additionalInchAreaValue = parseFloat(additionalInchArea) || 0;
      const additionalInchThicknessValue = parseFloat(additionalInchThickness) || 0;
      const additionalInchThicknessInFeet = additionalInchThicknessValue / 12;
      const additionalInchVolumeValue = additionalInchAreaValue * additionalInchThicknessInFeet;
      const additionalInchTonsValue = (additionalInchVolumeValue * 145) / 2000;
      const additionalInchAddTons = parseFloat(additionalInchAsphalt) || 0;
      const totalAdditionalInchTons = additionalInchTonsValue + additionalInchAddTons;
      const additionalInchExtraValue = totalAdditionalInchTons * 0.05;
      const finalAdditionalInchTons = Math.ceil(totalAdditionalInchTons + additionalInchExtraValue);

      const additionalInchCostValue = finalAdditionalInchTons * parseFloat(calculatedValues.pricePerTon);
      const additionalInchTruckingInCostValue = finalAdditionalInchTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const additionalInchLaborCostPerTon = additionalInchAreaValue <= 5000 ? 50 : 45;
      const additionalInchLaborCostValue = finalAdditionalInchTons * additionalInchLaborCostPerTon;

      const additionalInchTotalCostValue = additionalInchCostValue + 
                                       additionalInchTruckingInCostValue + 
                                       additionalInchLaborCostValue;

      // Calculate Driveway Widening Add On values
      const drivewayAreaValue = parseFloat(drivewayArea) || 0;
      
      // Asphalt calculations
      const drivewayAsphaltThicknessValue = parseFloat(calculatedValues.drivewayAsphaltThickness) || 0;
      const drivewayAsphaltThicknessInFeet = drivewayAsphaltThicknessValue / 12;
      const drivewayAsphaltVolumeValue = drivewayAreaValue * drivewayAsphaltThicknessInFeet;
      const drivewayAsphaltTonsValue = (drivewayAsphaltVolumeValue * 145) / 2000;
      const drivewayAdditionalAsphaltValue = parseFloat(drivewayAdditionalAsphalt) || 0;
      const totalDrivewayAsphaltTons = drivewayAsphaltTonsValue + drivewayAdditionalAsphaltValue;
      const drivewayExtraAsphaltValue = totalDrivewayAsphaltTons * 0.05;
      const finalDrivewayAsphaltTons = Math.ceil(totalDrivewayAsphaltTons + drivewayExtraAsphaltValue);

      const drivewayAsphaltCostValue = finalDrivewayAsphaltTons * parseFloat(calculatedValues.pricePerTon);
      const drivewayLaborCostPerTon = drivewayAreaValue <= 5000 ? 50 : 45;
      const drivewayLaborCostValue = finalDrivewayAsphaltTons * drivewayLaborCostPerTon;
      const drivewayTruckingInCostValue = finalDrivewayAsphaltTons * parseFloat(calculatedValues.truckingInCostPerTon);

      // Base calculations
      const drivewayBaseThicknessValue = parseFloat(calculatedValues.drivewayBaseThickness) || 0;
      const drivewayBaseThicknessInFeet = drivewayBaseThicknessValue / 12;
      const drivewayBaseVolumeValue = drivewayAreaValue * drivewayBaseThicknessInFeet;
      const drivewayBaseTonsValue = (drivewayBaseVolumeValue * 100) / 2000;
      const drivewayAdditionalBaseValue = parseFloat(drivewayAdditionalBase) || 0;
      const totalDrivewayBaseTons = drivewayBaseTonsValue + drivewayAdditionalBaseValue;
      const drivewayExtraBaseValue = totalDrivewayBaseTons * 0.05;
      const finalDrivewayBaseTons = Math.ceil(totalDrivewayBaseTons + drivewayExtraBaseValue);

      const drivewayBaseCostValue = finalDrivewayBaseTons * parseFloat(calculatedValues.basePricePerTon);
      const drivewayBaseTruckingInCostValue = finalDrivewayBaseTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const drivewayBaseLaborCostValue = finalDrivewayBaseTons * parseFloat(calculatedValues.baseLaborCostPerTon);

      // Dirt calculations
      const drivewayDirtThicknessValue = parseFloat(calculatedValues.drivewayDirtThickness) || 0;
      const drivewayDirtThicknessInFeet = drivewayDirtThicknessValue / 12;
      const drivewayDirtVolumeValue = drivewayAreaValue * drivewayDirtThicknessInFeet;
      const drivewayDirtTonsValue = (drivewayDirtVolumeValue * 100) / 2000;
      const drivewayExtraDirtValue = drivewayDirtTonsValue * 0.05;
      const finalDrivewayDirtTons = Math.ceil(drivewayDirtTonsValue + drivewayExtraDirtValue);

      const drivewayDirtTruckingOutCostValue = finalDrivewayDirtTons * parseFloat(calculatedValues.truckingOutCostPerTon);
      const drivewayDirtOutLaborCostValue = finalDrivewayDirtTons * parseFloat(calculatedValues.removalLaborCostPerTon);

      // Calculate added portion mobilization fee based on selection
      const addedPortionMobilizationFee = onlyAsphaltAdded === 'Yes' ? 750 : 0;

      const drivewayTotalCostValue = drivewayAsphaltCostValue +
                                   drivewayTruckingInCostValue +
                                   drivewayLaborCostValue +
                                   drivewayBaseCostValue +
                                   drivewayBaseTruckingInCostValue +
                                   drivewayBaseLaborCostValue +
                                   drivewayDirtTruckingOutCostValue +
                                   drivewayDirtOutLaborCostValue +
                                   addedPortionMobilizationFee;

      // Calculate total cost
      const concreteTotalCost = area === 0 ? 0 : asphaltCost +
                              truckingInCost +
                              installationLaborCost +
                              pavingMobilizationCost +
                              truckingOutCost +
                              removalLaborCost +
                              baseCost +
                              baseTruckingInCost +
                              baseLaborCost +
                              dirtTruckingOutCost +
                              dirtOutLaborCost +
                              parseFloat(calculatedValues.flatRateMobilizationFee) +
                              installationMileageCost +
                              removalMileageCost;

      setCalculatedValues(prev => ({
        ...prev,
        asphaltVolume: volume.toFixed(2),
        asphaltTons: totalAsphaltTons.toFixed(2),
        extraAsphalt: extraAsphalt.toFixed(2),
        totalAsphaltTons: finalTotalTons.toString(),
        asphaltCost: asphaltCost.toFixed(2),
        truckingInCost: truckingInCost.toFixed(2),
        laborCostPerTon: laborCostPerTon.toString(),
        installationLaborCost: installationLaborCost.toFixed(2),
        pavingMobilizationCost: pavingMobilizationCost.toString(),
        truckingOutCost: truckingOutCost.toFixed(2),
        removalLaborCost: removalLaborCost.toFixed(2),
        baseVolume: baseVolume.toFixed(2),
        baseTons: totalBaseTons.toFixed(2),
        extraBase: extraBase.toFixed(2),
        totalBaseTons: finalBaseTons.toString(),
        baseCost: baseCost.toFixed(2),
        baseTruckingInCost: baseTruckingInCost.toFixed(2),
        baseLaborCost: baseLaborCost.toFixed(2),
        dirtTruckingOutCost: dirtTruckingOutCost.toFixed(2),
        dirtOutLaborCost: dirtOutLaborCost.toFixed(2),
        installationMileageCost: installationMileageCost.toFixed(2),
        removalMileageCost: removalMileageCost.toFixed(2),
        concreteTotalCost: concreteTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        // Additional Inch values
        additionalInchVolume: additionalInchVolumeValue.toFixed(2),
        additionalInchTons: additionalInchTonsValue.toFixed(2),
        additionalInchExtra: additionalInchExtraValue.toFixed(2),
        additionalInchTotalTons: finalAdditionalInchTons.toString(),
        additionalInchCost: additionalInchCostValue.toFixed(2),
        additionalInchTruckingInCost: additionalInchTruckingInCostValue.toFixed(2),
        additionalInchLaborCost: additionalInchLaborCostValue.toFixed(2),
        additionalInchTotalCost: additionalInchTotalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        // Driveway Asphalt values
        drivewayAsphaltVolume: drivewayAsphaltVolumeValue.toFixed(2),
        drivewayAsphaltTons: totalDrivewayAsphaltTons.toFixed(2),
        drivewayExtraAsphalt: drivewayExtraAsphaltValue.toFixed(2),
        drivewayTotalAsphaltTons: finalDrivewayAsphaltTons.toString(),
        drivewayAsphaltCost: drivewayAsphaltCostValue.toFixed(2),
        drivewayLaborCostPerTon: drivewayLaborCostPerTon.toString(),
        drivewayLaborCost: drivewayLaborCostValue.toFixed(2),
        drivewayTruckingInCost: drivewayTruckingInCostValue.toFixed(2),

        // Driveway Base values
        drivewayBaseVolume: drivewayBaseVolumeValue.toFixed(2),
        drivewayBaseTons: totalDrivewayBaseTons.toFixed(2),
        drivewayExtraBase: drivewayExtraBaseValue.toFixed(2),
        drivewayTotalBaseTons: finalDrivewayBaseTons.toString(),
        drivewayBaseCost: drivewayBaseCostValue.toFixed(2),
        drivewayBaseTruckingInCost: drivewayBaseTruckingInCostValue.toFixed(2),
        drivewayBaseLaborCost: drivewayBaseLaborCostValue.toFixed(2),

        // Driveway Dirt values
        drivewayDirtVolume: drivewayDirtVolumeValue.toFixed(2),
        drivewayDirtTons: drivewayDirtTonsValue.toFixed(2),
        drivewayExtraDirt: drivewayExtraDirtValue.toFixed(2),
        drivewayTotalDirtTons: finalDrivewayDirtTons.toString(),
        drivewayDirtTruckingOutCost: drivewayDirtTruckingOutCostValue.toFixed(2),
        drivewayDirtOutLaborCost: drivewayDirtOutLaborCostValue.toFixed(2),
        drivewayAddedPortionMobilizationFee: addedPortionMobilizationFee.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        drivewayTotalCost: drivewayTotalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }));
    };

    calculateValues();
  }, [concreteArea, concreteAdditional, concreteAdditionalBase, distance,
      additionalInchArea, additionalInchAsphalt, additionalInchThickness,
      drivewayArea, drivewayAdditionalAsphalt, drivewayAdditionalBase, onlyAsphaltAdded,
      calculatedValues.asphaltThickness, calculatedValues.pricePerTon,
      calculatedValues.truckingInCostPerTon, calculatedValues.truckingOutCostPerTon,
      calculatedValues.removalLaborCostPerTon, calculatedValues.baseThickness,
      calculatedValues.basePricePerTon, calculatedValues.baseLaborCostPerTon,
      calculatedValues.flatRateMobilizationFee,
      calculatedValues.drivewayAsphaltThickness, calculatedValues.drivewayBaseThickness,
      calculatedValues.drivewayDirtThickness]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Concrete Out & Asphalt In' }} />
      
             <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.scrollContent}>
          {/* Default Values Button */}
          <View style={styles.defaultValuesContainer}>
            <Pressable
              style={styles.defaultValuesButton}
              onPress={() => {
                setTempDefaultValues({
                  pricePerTon: calculatedValues.pricePerTon,
                  truckingInCostPerTon: calculatedValues.truckingInCostPerTon,
                  truckingOutCostPerTon: calculatedValues.truckingOutCostPerTon,
                  removalLaborCostPerTon: calculatedValues.removalLaborCostPerTon,
                  basePricePerTon: calculatedValues.basePricePerTon,
                  baseLaborCostPerTon: calculatedValues.baseLaborCostPerTon
                });
                setIsDefaultValuesModalVisible(true);
              }}
            >
              <ThemedText style={styles.defaultValuesButtonText}>Change Default Values</ThemedText>
            </Pressable>
          </View>
          {/* Concrete Out Asphalt In Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Concrete Out Asphalt In" section="concrete" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', concreteArea, 'concrete', setConcreteArea),
                renderDisplayRow('Asphalt Thickness', calculatedValues.asphaltThickness, 'concrete'),
                renderDisplayRow('Asphalt Volume', calculatedValues.asphaltVolume, 'concrete'),
                renderDisplayRow('Additional Asphalt', concreteAdditional, 'concrete', setConcreteAdditional),
                renderDisplayRow('Asphalt Tons', calculatedValues.asphaltTons, 'concrete'),
                renderDisplayRow('Extra Asphalt (5%)', calculatedValues.extraAsphalt, 'concrete'),
                renderDisplayRow('Total Asphalt Tons', calculatedValues.totalAsphaltTons, 'concrete'),
                renderDisplayRow('Price Per Ton', calculatedValues.pricePerTon, 'concrete'),
                renderDisplayRow('Asphalt Cost', calculatedValues.asphaltCost, 'concrete'),
                renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'concrete'),
                renderDisplayRow('Trucking In Cost', calculatedValues.truckingInCost, 'concrete'),
                renderDisplayRow('Paving Mobilization Cost', calculatedValues.pavingMobilizationCost, 'concrete'),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.laborCostPerTon, 'concrete'),
                renderDisplayRow('Installation Labor Cost', calculatedValues.installationLaborCost, 'concrete'),
                renderDisplayRow('Trucking Out Cost per Ton', calculatedValues.truckingOutCostPerTon, 'concrete'),
                renderDisplayRow('Trucking Out Cost', calculatedValues.truckingOutCost, 'concrete'),
                renderDisplayRow('Removal Labor Cost per Ton', calculatedValues.removalLaborCostPerTon, 'concrete'),
                renderDisplayRow('Removal Labor Cost', calculatedValues.removalLaborCost, 'concrete'),
                renderDisplayRow('Base Thickness', calculatedValues.baseThickness, 'concrete'),
                renderDisplayRow('Base Volume', calculatedValues.baseVolume, 'concrete'),
                renderDisplayRow('Additional Base', concreteAdditionalBase, 'concrete', setConcreteAdditionalBase),
                renderDisplayRow('Base Tons', calculatedValues.baseTons, 'concrete'),
                renderDisplayRow('Extra Base (5%)', calculatedValues.extraBase, 'concrete'),
                renderDisplayRow('Total Base Tons', calculatedValues.totalBaseTons, 'concrete'),
                renderDisplayRow('Base Price per Ton', calculatedValues.basePricePerTon, 'concrete'),
                renderDisplayRow('Base Cost', calculatedValues.baseCost, 'concrete'),
                renderDisplayRow('Base Trucking In Cost', calculatedValues.baseTruckingInCost, 'concrete'),
                renderDisplayRow('Base Labor Cost per Ton', calculatedValues.baseLaborCostPerTon, 'concrete'),
                renderDisplayRow('Base Labor Cost', calculatedValues.baseLaborCost, 'concrete'),
                renderDisplayRow('Dirt Trucking Out Cost', calculatedValues.dirtTruckingOutCost, 'concrete'),
                renderDisplayRow('Dirt Out Labor Cost', calculatedValues.dirtOutLaborCost, 'concrete'),
                renderDisplayRow('Flat Rate Mobilization Fee', calculatedValues.flatRateMobilizationFee, 'concrete'),
                renderDisplayRow('Distance', distance, 'concrete', setDistance),
                renderDisplayRow('Installation Mileage Cost', calculatedValues.installationMileageCost, 'concrete'),
                renderDisplayRow('Removal Mileage Cost', calculatedValues.removalMileageCost, 'concrete'),
                renderDisplayRow('Total Cost', calculatedValues.concreteTotalCost, 'concrete')
              ].map((row) => (
                shouldShowRow(row.props.label, 'concrete') ? row : null
              ))}
            </View>
          </View>

          {/* Asphalt Additional Inch Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Asphalt Additional Inch" section="additionalInch" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', additionalInchArea, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Additional Inches', additionalInchThickness, 'additionalInch', setAdditionalInchThickness),
                renderDisplayRow('Asphalt Volume', calculatedValues.additionalInchVolume, 'additionalInch'),
                renderDisplayRow('Additional Asphalt', additionalInchAsphalt, 'additionalInch', setAdditionalInchAsphalt),
                renderDisplayRow('Asphalt Tons', calculatedValues.additionalInchTons, 'additionalInch'),
                renderDisplayRow('Extra Asphalt (5%)', calculatedValues.additionalInchExtra, 'additionalInch'),
                renderDisplayRow('Total Asphalt Tons', calculatedValues.additionalInchTotalTons, 'additionalInch'),
                renderDisplayRow('Price Per Ton', calculatedValues.pricePerTon, 'additionalInch'),
                renderDisplayRow('Asphalt Cost', calculatedValues.additionalInchCost, 'additionalInch'),
                renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'additionalInch'),
                renderDisplayRow('Trucking In Cost', calculatedValues.additionalInchTruckingInCost, 'additionalInch'),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.laborCostPerTon, 'additionalInch'),
                renderDisplayRow('Installation Labor Cost', calculatedValues.additionalInchLaborCost, 'additionalInch'),
                renderDisplayRow('Total Cost', calculatedValues.additionalInchTotalCost, 'additionalInch')
              ].map((row) => (
                shouldShowRow(row.props.label, 'additionalInch') ? row : null
              ))}
            </View>
          </View>

          {/* Driveway Widening Add On Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Driveway Widening Add On" section="driveway" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', drivewayArea, 'driveway', setDrivewayArea),
                renderDisplayRow('Asphalt Thickness', calculatedValues.drivewayAsphaltThickness, 'driveway'),
                renderDisplayRow('Asphalt Volume', calculatedValues.drivewayAsphaltVolume, 'driveway'),
                renderDisplayRow('Additional Asphalt', drivewayAdditionalAsphalt, 'driveway', setDrivewayAdditionalAsphalt),
                renderDisplayRow('Asphalt Tons', calculatedValues.drivewayAsphaltTons, 'driveway'),
                renderDisplayRow('Extra Asphalt (5%)', calculatedValues.drivewayExtraAsphalt, 'driveway'),
                renderDisplayRow('Total Asphalt Tons', calculatedValues.drivewayTotalAsphaltTons, 'driveway'),
                renderDisplayRow('Price Per Ton', calculatedValues.pricePerTon, 'driveway'),
                renderDisplayRow('Asphalt Cost', calculatedValues.drivewayAsphaltCost, 'driveway'),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.laborCostPerTon, 'driveway'),
                renderDisplayRow('Installation Labor Cost', calculatedValues.drivewayLaborCost, 'driveway'),
                renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'driveway'),
                renderDisplayRow('Trucking In Cost', calculatedValues.drivewayTruckingInCost, 'driveway'),
                renderDisplayRow('Base Thickness', calculatedValues.baseThickness, 'driveway'),
                renderDisplayRow('Base Volume', calculatedValues.drivewayBaseVolume, 'driveway'),
                renderDisplayRow('Additional Base', drivewayAdditionalBase, 'driveway', setDrivewayAdditionalBase),
                renderDisplayRow('Base Tons', calculatedValues.drivewayBaseTons, 'driveway'),
                renderDisplayRow('Extra Base (5%)', calculatedValues.drivewayExtraBase, 'driveway'),
                renderDisplayRow('Total Base Tons', calculatedValues.drivewayTotalBaseTons, 'driveway'),
                renderDisplayRow('Base Price per Ton', calculatedValues.basePricePerTon, 'driveway'),
                renderDisplayRow('Base Cost', calculatedValues.drivewayBaseCost, 'driveway'),
                renderDisplayRow('Base Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'driveway'),
                renderDisplayRow('Base Trucking In Cost', calculatedValues.drivewayBaseTruckingInCost, 'driveway'),
                renderDisplayRow('Base Labor Cost per Ton', calculatedValues.baseLaborCostPerTon, 'driveway'),
                renderDisplayRow('Base Labor Cost', calculatedValues.drivewayBaseLaborCost, 'driveway'),
                renderDisplayRow('Dirt Excavation Thickness', calculatedValues.drivewayDirtThickness, 'driveway'),
                renderDisplayRow('Dirt Volume', calculatedValues.drivewayDirtVolume, 'driveway'),
                renderDisplayRow('Dirt Tons', calculatedValues.drivewayDirtTons, 'driveway'),
                renderDisplayRow('Extra Dirt (5%)', calculatedValues.drivewayExtraDirt, 'driveway'),
                renderDisplayRow('Total Dirt Tons', calculatedValues.drivewayTotalDirtTons, 'driveway'),
                renderDisplayRow('Trucking Out Cost per Ton', calculatedValues.truckingOutCostPerTon, 'driveway'),
                renderDisplayRow('Dirt Trucking Out Cost', calculatedValues.drivewayDirtTruckingOutCost, 'driveway'),
                renderDisplayRow('Removal Labor Cost per Ton', calculatedValues.removalLaborCostPerTon, 'driveway'),
                renderDisplayRow('Dirt Out Labor Cost', calculatedValues.drivewayDirtOutLaborCost, 'driveway'),
                renderDisplayRow('Only Asphalt Portion Added to Driveway?', onlyAsphaltAdded, 'driveway'),
                renderDisplayRow('Added Portion Mobilization Fee', calculatedValues.drivewayAddedPortionMobilizationFee, 'driveway'),
                renderDisplayRow('Total Cost', calculatedValues.drivewayTotalCost, 'driveway')
              ].map((row) => (
                shouldShowRow(row.props.label, 'driveway') ? row : null
              ))}
            </View>
          </View>

                     {/* Total Cost Section */}
           <View style={[styles.sectionContainer, styles.totalCostSection]}>
             <View style={styles.sectionContent}>
               {[
                 renderDisplayRow('Commission Amount', commissionAmount, 'total', setCommissionAmount),
                 <View key="grandTotal" style={[styles.inputContainer, styles.grandTotalRow]}>
                   <ThemedText style={[styles.subtitle, styles.grandTotalLabel]}>Grand Total:</ThemedText>
                   <ThemedText style={[styles.value, styles.grandTotalValue]}>
                     ${(
                       parseFloat(calculatedValues.concreteTotalCost.replace(/,/g, '')) +
                       parseFloat(calculatedValues.additionalInchTotalCost.replace(/,/g, '')) +
                       parseFloat(calculatedValues.drivewayTotalCost.replace(/,/g, '')) +
                       (parseFloat(commissionAmount) || 0)
                     ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </ThemedText>
                 </View>
               ]}
             </View>
           </View>

           {/* New Quote Button */}
          <View style={styles.newQuoteContainer}>
            <Pressable
              style={styles.newQuoteButton}
              onPress={handleNewQuote}
            >
              <ThemedText style={styles.newQuoteButtonText}>New Quote</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Default Values Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDefaultValuesModalVisible}
        onRequestClose={() => setIsDefaultValuesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScrollView}>
              <ThemedText style={styles.modalTitle}>Default Values</ThemedText>
              
              {/* Asphalt Settings */}
              <ThemedText style={styles.modalSectionTitle}>Asphalt Settings</ThemedText>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Price Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.pricePerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, pricePerTon: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Trucking In Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.truckingInCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, truckingInCostPerTon: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Trucking Out Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.truckingOutCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, truckingOutCostPerTon: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Removal Labor Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.removalLaborCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, removalLaborCostPerTon: text }))}
                  keyboardType="numeric"
                />
              </View>

              {/* Base Settings */}
              <ThemedText style={styles.modalSectionTitle}>Base Settings</ThemedText>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Base Price Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.basePricePerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, basePricePerTon: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Base Labor Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.baseLaborCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, baseLaborCostPerTon: text }))}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsDefaultValuesModalVisible(false)}
              >
                <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveDefaultValues}
              >
                <ThemedText style={styles.modalButtonText}>Save</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Layout containers
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Row containers and backgrounds
  inputContainer: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  rowContent: {
    width: '100%',
  },
  rowEven: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  rowOdd: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  costRow: {
    backgroundColor: 'rgba(128, 128, 128, 0.25)',
  },
  totalRow: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },

  // Text styling
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    paddingRight: 10,
  },

  // Input field styling
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    width: '100%',
  },
  inputWithUnit: {
    gap: 4,
  },
  inputWithUnitSpacing: {
    marginBottom: 4,
  },
  unitContainer: {
    alignItems: 'flex-end',
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },

  // Section styling
  sectionContainer: {
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FF0000',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  sectionContent: {
    padding: 15,
  },

  selectionRowContainer: {
    flex: 1,
    gap: 10,
  },
  selectionContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  selectionButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF0000',
    backgroundColor: '#FFFFFF',
    minWidth: 100,
    alignItems: 'center',
  },
  selectionButtonSelected: {
    backgroundColor: '#FF0000',
  },
  selectionText: {
    fontSize: 16,
    color: '#FF0000',
    fontWeight: '500',
  },
  selectionTextSelected: {
    color: '#FFFFFF',
  },

  sectionTitleContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: '#FF0000',
    paddingTop: 15,
    paddingBottom: 10,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  toggleButtonContainer: {
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#FF4040',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000000',
    minWidth: 100,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  totalCostSection: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  grandTotalRow: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    paddingRight: 10,
  },
  grandTotalValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },

  newQuoteContainer: {
    padding: 20,
    alignItems: 'center',
  },
  newQuoteButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FF0000',
  },
  newQuoteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Default Values Button styling
  defaultValuesContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  defaultValuesButton: {
    backgroundColor: '#FF4040',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  defaultValuesButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalScrollView: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#FF0000',
  },
  modalInputContainer: {
    marginBottom: 15,
  },
  modalInputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#000000',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#CCCCCC',
  },
  modalSaveButton: {
    backgroundColor: '#FF0000',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 