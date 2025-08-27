// Import necessary dependencies from React and React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

// Import custom themed components
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Props interface for the DisplayRow component
type DisplayRowProps = {
  label: string;  // The label to display
  value: string;  // The value to display or edit
  section?: 'asphalt' | 'additionalInch' | 'base' | 'driveway' | 'total'; // Optional section identifier
  onChangeText?: (text: string) => void;  // Handler for text input changes
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

// Main screen component for Remove & Replace calculator
export default function RemoveReplaceScreen() {
  // Add ScrollView reference
  const scrollViewRef = useRef<ScrollView>(null);

  // Add state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    asphalt: false,
    additionalInch: false,
    base: false,
    driveway: false
  });

  // Function to reset all inputs
  const handleNewQuote = () => {
    // Reset all input states
    setAsphaltArea('');
    setAsphaltAdditional('');
    setDistance('');
    setAdditionalInchArea('');
    setAdditionalInchAsphalt('');
    setAdditionalInchThickness('');
    setBaseArea('');
    setBaseAdditional('');
    setDrivewayArea('');
    setDrivewayAdditionalAsphalt('');
    setDrivewayAdditionalBase('');
    setOnlyAsphaltAdded('No');
    setCommissionAmount('');

    // Scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Function to toggle section expansion
  const toggleSection = (section: 'asphalt' | 'additionalInch' | 'base' | 'driveway') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper function to determine if a row should be shown
  const shouldShowRow = (label: string, section: 'asphalt' | 'additionalInch' | 'base' | 'driveway' | 'total') => {
    if (section === 'total') return true;  // Always show total section rows
    const isExpanded = expandedSections[section];
    const isCostRow = [
      // Asphalt Remove & Replace costs
      'Total Asphalt Tons',
      'Asphalt Cost',
      'Trucking In Cost',
      'Installation Labor Cost',
      'Paving Mobilization Cost',
      'Trucking Out Cost',
      'Removal Labor Cost',
      'Flat Rate Mobilization Fee',
      'Installation Mileage Cost',
      'Removal Mileage Cost',
      // Additional Inch costs
      'Total Asphalt Tons',
      'Asphalt Cost',
      'Trucking In Cost',
      'Installation Labor Cost',
      // Base Replacement costs
      'Total Base Tons',
      'Base Cost',
      'Base Trucking In Cost',
      'Base Labor Cost',
      'Total Dirt Tons',
      'Dirt Trucking Out Cost',
      'Dirt Out Labor Cost',
      // Driveway Widening costs
      'Total Asphalt Tons',
      'Asphalt Trucking In Cost',
      'Asphalt Cost',
      'Installation Labor Cost',
      'Total Base Tons',
      'Base Cost',
      'Base Trucking In Cost',
      'Base Labor Cost',
      'Total Dirt Tons',
      'Dirt Trucking Out Cost',
      'Dirt Out Labor Cost',
      'Only Asphalt Portion Added to Driveway?',
      'Added Portion Mobilization Fee'
    ].includes(label);
    
    const isInputRow = label === 'Total Area' || 
                      label === 'Distance' || 
                      label === 'Additional Inches' ||
                      label === 'Commission Amount';
    
    // Always show cost rows, input rows, and total cost, hide others when collapsed
    return isExpanded || isCostRow || isInputRow || label === 'Total Cost';
  };

  // Section Title component with toggle button
  const SectionTitle = ({ title, section }: { title: string, section: 'asphalt' | 'additionalInch' | 'base' | 'driveway' }) => (
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
  // Asphalt Remove & Replace inputs
  const [asphaltArea, setAsphaltArea] = useState('');           // Total area in square feet
  const [asphaltAdditional, setAsphaltAdditional] = useState('');  // Additional asphalt in tons
  const [distance, setDistance] = useState('');             // Distance in miles
  
  // Additional Inch section inputs
  const [additionalInchArea, setAdditionalInchArea] = useState('');           // Total area in square feet
  const [additionalInchAsphalt, setAdditionalInchAsphalt] = useState('');     // Additional asphalt in tons
  const [additionalInchThickness, setAdditionalInchThickness] = useState(''); // Additional asphalt thickness
  
  // Existing Base inputs
  const [baseArea, setBaseArea] = useState('');           // Total area in square feet
  const [baseAdditional, setBaseAdditional] = useState(''); // Additional base in tons

  // Driveway inputs
  const [drivewayArea, setDrivewayArea] = useState('');    // Driveway area in square feet
  const [drivewayAdditionalAsphalt, setDrivewayAdditionalAsphalt] = useState(''); // Additional asphalt for driveway
  const [drivewayAdditionalBase, setDrivewayAdditionalBase] = useState(''); // Additional base for driveway
  const [onlyAsphaltAdded, setOnlyAsphaltAdded] = useState('No'); // Whether only asphalt is added to driveway

  // Total Cost section inputs
  const [commissionAmount, setCommissionAmount] = useState(''); // Commission amount

  // Function to save default values to AsyncStorage
  const saveDefaultValues = async (values: typeof tempDefaultValues) => {
    try {
      await AsyncStorage.setItem('removeReplaceDefaults', JSON.stringify(values));
    } catch (error) {
      console.error('Error saving default values:', error);
    }
  };

  // Function to load default values from AsyncStorage
  const loadDefaultValues = async () => {
    try {
      const savedValues = await AsyncStorage.getItem('removeReplaceDefaults');
      if (savedValues) {
        const parsedValues = JSON.parse(savedValues);
        setCalculatedValues(prev => ({
          ...prev,
          pricePerTon: parsedValues.pricePerTon,
          truckingInCostPerTon: parsedValues.truckingInCostPerTon,
          truckingOutCostPerTon: parsedValues.truckingOutCostPerTon,
          removalLaborCostPerTon: parsedValues.removalLaborCostPerTon,
          flatRateMobilizationFee: parsedValues.flatRateMobilizationFee,
          basePricePerTon: parsedValues.basePricePerTon,
          baseTruckingInCostPerTon: parsedValues.baseTruckingInCostPerTon,
          baseLaborCostPerTon: parsedValues.baseLaborCostPerTon,
          dirtExcavationThickness: parsedValues.dirtExcavationThickness,
          dirtTruckingOutCostPerTon: parsedValues.dirtTruckingOutCostPerTon,
          dirtLaborCostPerTon: parsedValues.dirtLaborCostPerTon
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

  // Modal state
  const [isDefaultValuesModalVisible, setIsDefaultValuesModalVisible] = useState(false);
  const [tempDefaultValues, setTempDefaultValues] = useState({
    pricePerTon: '100',
    truckingInCostPerTon: '10',
    truckingOutCostPerTon: '15',
    removalLaborCostPerTon: '38',
    flatRateMobilizationFee: '200',
    basePricePerTon: '17',
    baseTruckingInCostPerTon: '10',
    baseLaborCostPerTon: '15',
    dirtExcavationThickness: '6',
    dirtTruckingOutCostPerTon: '15',
    dirtLaborCostPerTon: '38'
  });

  // Function to save default values
  const handleSaveDefaultValues = async () => {
    // Save to state
    setCalculatedValues(prev => ({
      ...prev,
      pricePerTon: tempDefaultValues.pricePerTon,
      truckingInCostPerTon: tempDefaultValues.truckingInCostPerTon,
      truckingOutCostPerTon: tempDefaultValues.truckingOutCostPerTon,
      removalLaborCostPerTon: tempDefaultValues.removalLaborCostPerTon,
      flatRateMobilizationFee: tempDefaultValues.flatRateMobilizationFee,
      basePricePerTon: tempDefaultValues.basePricePerTon,
      baseTruckingInCostPerTon: tempDefaultValues.baseTruckingInCostPerTon,
      baseLaborCostPerTon: tempDefaultValues.baseLaborCostPerTon,
      dirtExcavationThickness: tempDefaultValues.dirtExcavationThickness,
      dirtTruckingOutCostPerTon: tempDefaultValues.dirtTruckingOutCostPerTon,
      dirtLaborCostPerTon: tempDefaultValues.dirtLaborCostPerTon
    }));

    // Save to AsyncStorage
    await saveDefaultValues(tempDefaultValues);
    
    setIsDefaultValuesModalVisible(false);
  };

  // State for all calculated values and constants
const [calculatedValues, setCalculatedValues] = useState({
    // Asphalt measurements
    asphaltThickness: '3',          // Default thickness in inches
    asphaltVolume: '0',             // Volume in cubic feet
    asphaltTons: '0',               // Base tonnage before waste
    extraAsphalt: '0',              // Additional 5% for waste
    totalAsphaltTons: '0',          // Total tonnage including waste

    // Additional Inch measurements
    additionalInchVolume: '0',      // Volume in cubic feet
    additionalInchTons: '0',        // Base tonnage before waste
    additionalInchExtra: '0',       // Additional 5% for waste
    additionalInchTotalTons: '0',   // Total tonnage including waste
    additionalInchCost: '0',        // Total material cost
    additionalInchTruckingInCost: '0', // Total delivery cost
    additionalInchLaborCost: '0',   // Total installation labor
    additionalInchTotalCost: '0',   // Sum of all additional inch costs

    // Asphalt cost rates
    pricePerTon: '100',             // Base price per ton of asphalt
    truckingInCostPerTon: '10',     // Cost per ton for delivery
    truckingOutCostPerTon: '15',    // Cost per ton for removal
    removalLaborCostPerTon: '38',   // Labor cost per ton for removal
    laborCostPerTon: '0',           // Variable labor rate based on area

    // Asphalt calculated costs
    asphaltCost: '0',               // Total material cost
    truckingInCost: '0',            // Total delivery cost
    installationLaborCost: '0',      // Total installation labor
    pavingMobilizationCost: '0',    // Variable based on area size
    truckingOutCost: '0',           // Total removal transport cost
    removalLaborCost: '0',          // Total removal labor cost
    
    // Asphalt fixed and distance-based costs
    flatRateMobilizationFee: '200', // Base mobilization fee
    installationMileageCost: '0',   // Additional cost for distance > 10 miles
    removalMileageCost: '0',        // Additional cost for distance > 10 miles
    asphaltTotalCost: '0',          // Sum of all asphalt costs

    // Base measurements
    baseThickness: '6',            // Default thickness in inches
    baseVolume: '0',              // Volume in cubic feet
    baseTons: '0',                // Base tonnage before waste
    extraBase: '0',               // Additional 5% for waste
    totalBaseTons: '0',           // Total tonnage including waste

    // Base cost rates
    basePricePerTon: '17',            // Base price per ton
    baseTruckingInCostPerTon: '10', // Cost per ton for delivery
    baseLaborCostPerTon: '15',    // Labor cost per ton

    // Base calculated costs
    baseCost: '0',                // Total material cost
    baseTruckingInCost: '0',      // Total delivery cost
    baseLaborCost: '0',           // Total labor cost

    // Dirt measurements
    dirtExcavationThickness: '6',  // Default thickness in inches
    dirtVolume: '0',              // Volume in cubic feet
    dirtTons: '0',                // Base tonnage before waste
    extraDirt: '0',               // Additional 5% for waste
    totalDirtTons: '0',           // Total tonnage including waste

    // Dirt cost rates
    dirtTruckingOutCostPerTon: '15', // Cost per ton for removal
    dirtLaborCostPerTon: '38',    // Labor cost per ton for removal

    // Dirt calculated costs
    dirtTruckingOutCost: '0',     // Total removal transport cost
    dirtOutLaborCost: '0',        // Total removal labor cost

    baseTotalCost: '0',           // Sum of all base costs

    // Driveway widening measurements
    driveAsphaltVolume: '0',      // Volume in cubic feet
    driveAsphaltTons: '0',        // Base tonnage before waste
    driveExtraAsphalt: '0',       // Additional 5% for waste
    driveTotalAsphaltTons: '0',   // Total tonnage including waste

    // Driveway widening asphalt costs
    driveAsphaltCost: '0',        // Total material cost
    driveTruckingInCost: '0',     // Total delivery cost
    driveInstallationLaborCost: '0', // Total installation labor

    // Driveway widening base measurements
    driveBaseVolume: '0',         // Volume in cubic feet
    driveBaseTons: '0',           // Base tonnage before waste
    driveExtraBase: '0',          // Additional 5% for waste
    driveTotalBaseTons: '0',      // Total tonnage including waste

    // Driveway widening base costs
    driveBaseCost: '0',           // Total material cost
    driveBaseTruckingInCost: '0', // Total delivery cost
    driveBaseLaborCost: '0',      // Total labor cost

    // Driveway widening dirt measurements
    driveDirtExcavationThickness: '9',  // Default thickness in inches for driveway dirt excavation
    driveDirtVolume: '0',         // Volume in cubic feet
    driveDirtTons: '0',           // Base tonnage before waste
    driveDirtExtra: '0',          // Additional 5% for waste
    driveTotalDirtTons: '0',      // Total tonnage including waste

    // Driveway widening dirt costs
    driveDirtTruckingOutCost: '0', // Total removal transport cost
    driveDirtOutLaborCost: '0',    // Total removal labor cost

    drivewayTotalCost: '0',        // Sum of all driveway costs
    addedPortionMobilizationFee: '0', // Mobilization fee for added portion
  });

  // Effect hook to recalculate all values when inputs change
useEffect(() => {
    const calculateValues = () => {
      // Parse input values with fallback to 0
      const area = parseFloat(asphaltArea) || 0;
      const baseAreaValue = parseFloat(baseArea) || 0;
      const thickness = parseFloat(calculatedValues.asphaltThickness) || 0;

      // Asphalt calculations
      const totalThicknessInFeet = thickness / 12;
      const volume = area * totalThicknessInFeet;
      const tons = (volume * 145) / 2000;
      const additionalTons = parseFloat(asphaltAdditional) || 0;
      const totalAsphaltTons = tons + additionalTons;
      const extraAsphalt = totalAsphaltTons * 0.05;
      const totalTons = Math.ceil(totalAsphaltTons + extraAsphalt);

      const asphaltCost = Math.ceil(totalTons * parseFloat(calculatedValues.pricePerTon) / 100) * 100;
      const truckingInCost = totalTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const laborCostPerTon = area <= 5000 ? 50 : 45;
      const installationLaborCost = totalTons * laborCostPerTon;
      const truckingOutCost = totalTons * parseFloat(calculatedValues.truckingOutCostPerTon);
      const removalLaborCost = totalTons * parseFloat(calculatedValues.removalLaborCostPerTon);

      const distanceValue = parseFloat(distance) || 0;
      const extraMiles = Math.max(0, distanceValue - 10);
      const installationMileageCost = extraMiles * 20;
      const removalMileageCost = extraMiles * 10;

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

      const asphaltTotalCost = area === 0 ? 0 : asphaltCost + 
                              truckingInCost + 
                              installationLaborCost + 
                              pavingMobilizationCost + 
                              truckingOutCost + 
                              removalLaborCost + 
                              parseFloat(calculatedValues.flatRateMobilizationFee) + 
                              installationMileageCost + 
                              removalMileageCost;

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

      const additionalInchCostValue = Math.ceil(finalAdditionalInchTons * parseFloat(calculatedValues.pricePerTon) / 100) * 100;
      const additionalInchTruckingInCostValue = finalAdditionalInchTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const additionalInchLaborCostPerTon = additionalInchAreaValue <= 5000 ? 50 : 45;
      const additionalInchLaborCostValue = finalAdditionalInchTons * additionalInchLaborCostPerTon;

      const additionalInchTotalCostValue = additionalInchCostValue + 
                                         additionalInchTruckingInCostValue + 
                                         additionalInchLaborCostValue;

      // Base and dirt calculations
      const baseThickness = parseFloat(calculatedValues.baseThickness) || 0;
      const dirtThickness = parseFloat(calculatedValues.dirtExcavationThickness) || 0;

      const baseVolume = (baseAreaValue * baseThickness) / 12;
      const baseTons = (baseVolume * 100) / 2000;
      const additionalBaseTons = parseFloat(baseAdditional) || 0;
      const totalBaseTons = baseTons + additionalBaseTons;
      const extraBase = totalBaseTons * 0.05;
      const finalBaseTons = Math.ceil(totalBaseTons + extraBase);

      const dirtVolume = (baseAreaValue * dirtThickness) / 12;
      const dirtTons = (dirtVolume * 100) / 2000;
      const extraDirt = dirtTons * 0.05;
      const totalDirtTons = Math.ceil(dirtTons + extraDirt);

      const baseCost = finalBaseTons * parseFloat(calculatedValues.basePricePerTon);
      const baseTruckingInCost = finalBaseTons * parseFloat(calculatedValues.baseTruckingInCostPerTon);
      const baseLaborCost = finalBaseTons * parseFloat(calculatedValues.baseLaborCostPerTon);

      const dirtTruckingOutCost = totalDirtTons * parseFloat(calculatedValues.dirtTruckingOutCostPerTon);
      const dirtOutLaborCost = totalDirtTons * parseFloat(calculatedValues.dirtLaborCostPerTon);

      const baseTotalCost = baseCost + 
                           baseTruckingInCost + 
                           baseLaborCost + 
                           dirtTruckingOutCost + 
                           dirtOutLaborCost;

      // Driveway widening calculations
      const driveArea = parseFloat(drivewayArea) || 0;

      // Driveway asphalt calculations
      const driveAsphaltVolume = (driveArea * 3) / 12; // 3 inches thickness
      const driveAsphaltTons = (driveAsphaltVolume * 145) / 2000;
      const driveAdditionalTons = parseFloat(drivewayAdditionalAsphalt) || 0;
      const driveTotalAsphaltTons = driveAsphaltTons + driveAdditionalTons;
      const driveExtraAsphalt = driveTotalAsphaltTons * 0.05;
      const driveFinalAsphaltTons = Math.ceil(driveTotalAsphaltTons + driveExtraAsphalt);

      const driveAsphaltCost = Math.ceil(driveFinalAsphaltTons * parseFloat(calculatedValues.pricePerTon) / 100) * 100;
      const driveTruckingInCost = driveFinalAsphaltTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const driveLaborCostPerTon = driveArea <= 5000 ? 50 : 45;
      const driveInstallationLaborCost = driveFinalAsphaltTons * driveLaborCostPerTon;

      // Driveway base calculations
      const driveBaseVolume = (driveArea * 6) / 12; // 6 inches thickness
      const driveBaseTons = (driveBaseVolume * 100) / 2000;
      const driveAdditionalBaseTons = parseFloat(drivewayAdditionalBase) || 0;
      const driveTotalBaseTons = driveBaseTons + driveAdditionalBaseTons;
      const driveExtraBase = driveTotalBaseTons * 0.05;
      const driveFinalBaseTons = Math.ceil(driveTotalBaseTons + driveExtraBase);

      const driveBaseCost = driveFinalBaseTons * parseFloat(calculatedValues.basePricePerTon);
      const driveBaseTruckingInCost = driveFinalBaseTons * parseFloat(calculatedValues.baseTruckingInCostPerTon);
      const driveBaseLaborCost = driveFinalBaseTons * parseFloat(calculatedValues.baseLaborCostPerTon);

      // Driveway dirt calculations
      const driveDirtVolume = (driveArea * parseFloat(calculatedValues.driveDirtExcavationThickness)) / 12; // Use constant for thickness
      const driveDirtTons = (driveDirtVolume * 100) / 2000;
      const driveDirtExtra = driveDirtTons * 0.05;
      const driveTotalDirtTons = Math.ceil(driveDirtTons + driveDirtExtra);

      const driveDirtTruckingOutCost = driveTotalDirtTons * parseFloat(calculatedValues.dirtTruckingOutCostPerTon);
      const driveDirtOutLaborCost = driveTotalDirtTons * parseFloat(calculatedValues.dirtLaborCostPerTon);

      const drivewayTotalCost = driveAsphaltCost + 
                               driveTruckingInCost + 
                               driveInstallationLaborCost + 
                               driveBaseCost + 
                               driveBaseTruckingInCost + 
                               driveBaseLaborCost + 
                               driveDirtTruckingOutCost + 
                               driveDirtOutLaborCost;

      const addedPortionMobilizationFee = onlyAsphaltAdded === 'Yes' ? 750 : 0;

      const finalDrivewayTotalCost = drivewayTotalCost + addedPortionMobilizationFee;

      setCalculatedValues(prev => ({
        ...prev,
        // Asphalt values
        asphaltVolume: volume.toFixed(2),
        asphaltTons: tons.toFixed(2),
        extraAsphalt: extraAsphalt.toFixed(2),
        totalAsphaltTons: totalTons.toString(),
        asphaltCost: asphaltCost.toFixed(2),
        truckingInCost: truckingInCost.toFixed(2),
        laborCostPerTon: laborCostPerTon.toString(),
        installationLaborCost: installationLaborCost.toFixed(2),
        pavingMobilizationCost: pavingMobilizationCost.toString(),
        truckingOutCost: truckingOutCost.toFixed(2),
        removalLaborCost: removalLaborCost.toFixed(2),
        installationMileageCost: installationMileageCost.toFixed(2),
        removalMileageCost: removalMileageCost.toFixed(2),
        asphaltTotalCost: asphaltTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        // Base and dirt values
        baseVolume: baseVolume.toFixed(2),
        baseTons: totalBaseTons.toFixed(2),
        extraBase: extraBase.toFixed(2),
        totalBaseTons: finalBaseTons.toString(),
        baseCost: baseCost.toFixed(2),
        baseTruckingInCost: baseTruckingInCost.toFixed(2),
        baseLaborCost: baseLaborCost.toFixed(2),
        dirtVolume: dirtVolume.toFixed(2),
        dirtTons: dirtTons.toFixed(2),
        extraDirt: extraDirt.toFixed(2),
        totalDirtTons: totalDirtTons.toString(),
        dirtTruckingOutCost: dirtTruckingOutCost.toFixed(2),
        dirtOutLaborCost: dirtOutLaborCost.toFixed(2),
        baseTotalCost: baseTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        // Driveway widening values
        driveAsphaltVolume: driveAsphaltVolume.toFixed(2),
        driveAsphaltTons: driveTotalAsphaltTons.toFixed(2),
        driveExtraAsphalt: driveExtraAsphalt.toFixed(2),
        driveTotalAsphaltTons: driveFinalAsphaltTons.toString(),
        driveAsphaltCost: driveAsphaltCost.toFixed(2),
        driveTruckingInCost: driveTruckingInCost.toFixed(2),
        driveInstallationLaborCost: driveInstallationLaborCost.toFixed(2),
        driveBaseVolume: driveBaseVolume.toFixed(2),
        driveBaseTons: driveTotalBaseTons.toFixed(2),
        driveExtraBase: driveExtraBase.toFixed(2),
        driveTotalBaseTons: driveFinalBaseTons.toString(),
        driveBaseCost: driveBaseCost.toFixed(2),
        driveBaseTruckingInCost: driveBaseTruckingInCost.toFixed(2),
        driveBaseLaborCost: driveBaseLaborCost.toFixed(2),
        driveDirtVolume: driveDirtVolume.toFixed(2),
        driveDirtTons: driveDirtTons.toFixed(2),
        driveDirtExtra: driveDirtExtra.toFixed(2),
        driveTotalDirtTons: driveTotalDirtTons.toString(),
        driveDirtTruckingOutCost: driveDirtTruckingOutCost.toFixed(2),
        driveDirtOutLaborCost: driveDirtOutLaborCost.toFixed(2),
        drivewayTotalCost: finalDrivewayTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        addedPortionMobilizationFee: addedPortionMobilizationFee.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),

        // Additional Inch values
        additionalInchVolume: additionalInchVolumeValue.toFixed(2),
        additionalInchTons: additionalInchTonsValue.toFixed(2),
        additionalInchExtra: additionalInchExtraValue.toFixed(2),
        additionalInchTotalTons: finalAdditionalInchTons.toString(),
        additionalInchCost: additionalInchCostValue.toFixed(2),
        additionalInchTruckingInCost: additionalInchTruckingInCostValue.toFixed(2),
        additionalInchLaborCost: additionalInchLaborCostValue.toFixed(2),
        additionalInchTotalCost: additionalInchTotalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }));
    };

    calculateValues();
  }, [asphaltArea, asphaltAdditional, distance,
      additionalInchArea, additionalInchAsphalt, additionalInchThickness,
      baseArea, baseAdditional,
      drivewayArea, drivewayAdditionalAsphalt, drivewayAdditionalBase,
      onlyAsphaltAdded,
      calculatedValues.asphaltThickness, calculatedValues.pricePerTon,
      calculatedValues.truckingInCostPerTon, calculatedValues.truckingOutCostPerTon,
      calculatedValues.removalLaborCostPerTon, calculatedValues.flatRateMobilizationFee,
      calculatedValues.baseThickness, calculatedValues.dirtExcavationThickness,
      calculatedValues.basePricePerTon, calculatedValues.baseTruckingInCostPerTon,
      calculatedValues.baseLaborCostPerTon, calculatedValues.dirtTruckingOutCostPerTon,
      calculatedValues.dirtLaborCostPerTon, calculatedValues.driveDirtExcavationThickness]);

  const renderDisplayRow = React.useCallback((label: string, value: string, section: DisplayRowProps['section'], handler?: (text: string) => void) => {
    const isInputRow = label === 'Total Area' || 
                      label === 'Distance' || 
                      label === 'Additional Inches' ||
                      label === 'Commission Amount' ||
                      label === 'Additional Asphalt' ||
                      label === 'Additional Base';

    const isCostRow = [
      // Asphalt Remove & Replace costs
      'Total Asphalt Tons',
      'Asphalt Cost',
      'Trucking In Cost',
      'Installation Labor Cost',
      'Paving Mobilization Cost',
      'Trucking Out Cost',
      'Removal Labor Cost',
      'Flat Rate Mobilization Fee',
      'Installation Mileage Cost',
      'Removal Mileage Cost',
      // Base Replacement costs
      'Total Base Tons',
      'Base Cost',
      'Base Trucking In Cost',
      'Base Labor Cost',
      'Total Dirt Tons',
      'Dirt Trucking Out Cost',
      'Dirt Out Labor Cost',
      // Driveway Widening costs
      'Total Asphalt Tons',
      'Asphalt Trucking In Cost',
      'Asphalt Cost',
      'Installation Labor Cost',
      'Total Base Tons',
      'Base Cost',
      'Base Trucking In Cost',
      'Base Labor Cost',
      'Total Dirt Tons',
      'Dirt Trucking Out Cost',
      'Dirt Out Labor Cost',
      'Only Asphalt Portion Added to Driveway?',
      'Added Portion Mobilization Fee'
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
  }, [onlyAsphaltAdded]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Remove & Replace' }} />
      
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
                // Initialize temp values with current values
                setTempDefaultValues({
                  pricePerTon: calculatedValues.pricePerTon,
                  truckingInCostPerTon: calculatedValues.truckingInCostPerTon,
                  truckingOutCostPerTon: calculatedValues.truckingOutCostPerTon,
                  removalLaborCostPerTon: calculatedValues.removalLaborCostPerTon,
                  flatRateMobilizationFee: calculatedValues.flatRateMobilizationFee,
                  basePricePerTon: calculatedValues.basePricePerTon,
                  baseTruckingInCostPerTon: calculatedValues.baseTruckingInCostPerTon,
                  baseLaborCostPerTon: calculatedValues.baseLaborCostPerTon,
                  dirtExcavationThickness: calculatedValues.dirtExcavationThickness,
                  dirtTruckingOutCostPerTon: calculatedValues.dirtTruckingOutCostPerTon,
                  dirtLaborCostPerTon: calculatedValues.dirtLaborCostPerTon
                });
                setIsDefaultValuesModalVisible(true);
              }}
            >
              <ThemedText style={styles.defaultValuesButtonText}>Change Default Values</ThemedText>
            </Pressable>
          </View>

          {/* Asphalt Remove & Replace Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Asphalt Remove & Replace" section="asphalt" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', asphaltArea, 'asphalt', setAsphaltArea),
                renderDisplayRow('Asphalt Thickness', calculatedValues.asphaltThickness, 'asphalt', setAsphaltArea),
                renderDisplayRow('Asphalt Volume', calculatedValues.asphaltVolume, 'asphalt', setAsphaltArea),
                renderDisplayRow('Additional Asphalt', asphaltAdditional, 'asphalt', setAsphaltAdditional),
                renderDisplayRow('Asphalt Tons', calculatedValues.asphaltTons, 'asphalt', setAsphaltArea),
                renderDisplayRow('Extra Asphalt (5%)', calculatedValues.extraAsphalt, 'asphalt', setAsphaltArea),
                renderDisplayRow('Total Asphalt Tons', calculatedValues.totalAsphaltTons, 'asphalt', setAsphaltArea),
                renderDisplayRow('Price Per Ton', calculatedValues.pricePerTon, 'asphalt', setAsphaltArea),
                renderDisplayRow('Asphalt Cost', calculatedValues.asphaltCost, 'asphalt', setAsphaltArea),
                renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'asphalt', setAsphaltArea),
                renderDisplayRow('Trucking In Cost', calculatedValues.truckingInCost, 'asphalt', setAsphaltArea),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.laborCostPerTon, 'asphalt', setAsphaltArea),
                renderDisplayRow('Installation Labor Cost', calculatedValues.installationLaborCost, 'asphalt', setAsphaltArea),
                renderDisplayRow('Paving Mobilization Cost', calculatedValues.pavingMobilizationCost, 'asphalt', setAsphaltArea),
                renderDisplayRow('Trucking Out Cost per Ton', calculatedValues.truckingOutCostPerTon, 'asphalt', setAsphaltArea),
                renderDisplayRow('Trucking Out Cost', calculatedValues.truckingOutCost, 'asphalt', setAsphaltArea),
                renderDisplayRow('Removal Labor Cost per Ton', calculatedValues.removalLaborCostPerTon, 'asphalt', setAsphaltArea),
                renderDisplayRow('Removal Labor Cost', calculatedValues.removalLaborCost, 'asphalt', setAsphaltArea),
                renderDisplayRow('Flat Rate Mobilization Fee', calculatedValues.flatRateMobilizationFee, 'asphalt', setAsphaltArea),
                renderDisplayRow('Distance', distance, 'asphalt', setDistance),
                renderDisplayRow('Installation Mileage Cost', calculatedValues.installationMileageCost, 'asphalt', setAsphaltArea),
                renderDisplayRow('Removal Mileage Cost', calculatedValues.removalMileageCost, 'asphalt', setAsphaltArea),
                renderDisplayRow('Total Cost', calculatedValues.asphaltTotalCost, 'asphalt', setAsphaltArea)
              ].map((row) => (
                shouldShowRow(row.props.label, 'asphalt') ? row : null
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
                renderDisplayRow('Asphalt Volume', calculatedValues.additionalInchVolume, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Additional Asphalt', additionalInchAsphalt, 'additionalInch', setAdditionalInchAsphalt),
                renderDisplayRow('Asphalt Tons', calculatedValues.additionalInchTons, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Extra Asphalt (5%)', calculatedValues.additionalInchExtra, 'additionalInch', setAdditionalInchThickness),
                renderDisplayRow('Total Asphalt Tons', calculatedValues.additionalInchTotalTons, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Price Per Ton', calculatedValues.pricePerTon, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Asphalt Cost', calculatedValues.additionalInchCost, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Trucking In Cost', calculatedValues.additionalInchTruckingInCost, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.laborCostPerTon, 'additionalInch', setAdditionalInchThickness),
                renderDisplayRow('Installation Labor Cost', calculatedValues.additionalInchLaborCost, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Total Cost', calculatedValues.additionalInchTotalCost, 'additionalInch', setAdditionalInchArea)
              ].map((row) => (
                shouldShowRow(row.props.label, 'additionalInch') ? row : null
              ))}
            </View>
          </View>

          {/* Existing Base Replacement Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Existing Base Replacement" section="base" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', baseArea, 'base', setBaseArea),
                renderDisplayRow('Base Thickness', calculatedValues.baseThickness, 'base', setBaseArea),
                renderDisplayRow('Base Volume', calculatedValues.baseVolume, 'base', setBaseArea),
                renderDisplayRow('Additional Base', baseAdditional, 'base', setBaseAdditional),
                renderDisplayRow('Base Tons', calculatedValues.baseTons, 'base', setBaseArea),
                renderDisplayRow('Extra Base (5%)', calculatedValues.extraBase, 'base', setBaseAdditional),
                renderDisplayRow('Total Base Tons', calculatedValues.totalBaseTons, 'base', setBaseArea),
                renderDisplayRow('Price per Ton', calculatedValues.basePricePerTon, 'base', setBaseArea),
                renderDisplayRow('Base Cost', calculatedValues.baseCost, 'base', setBaseArea),
                renderDisplayRow('Base Trucking In Cost per Ton', calculatedValues.baseTruckingInCostPerTon, 'base', setBaseArea),
                renderDisplayRow('Base Trucking In Cost', calculatedValues.baseTruckingInCost, 'base', setBaseArea),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.baseLaborCostPerTon, 'base', setBaseArea),
                renderDisplayRow('Base Labor Cost', calculatedValues.baseLaborCost, 'base', setBaseArea),
                renderDisplayRow('Dirt Excavation Thickness', calculatedValues.dirtExcavationThickness, 'base', setBaseArea),
                renderDisplayRow('Dirt Volume', calculatedValues.dirtVolume, 'base', setBaseArea),
                renderDisplayRow('Dirt Tons', calculatedValues.dirtTons, 'base', setBaseArea),
                renderDisplayRow('Extra Dirt (5%)', calculatedValues.extraDirt, 'base', setBaseArea),
                renderDisplayRow('Total Dirt Tons', calculatedValues.totalDirtTons, 'base', setBaseArea),
                renderDisplayRow('Dirt Trucking Out Cost per Ton', calculatedValues.dirtTruckingOutCostPerTon, 'base', setBaseArea),
                renderDisplayRow('Dirt Trucking Out Cost', calculatedValues.dirtTruckingOutCost, 'base', setBaseArea),
                renderDisplayRow('Dirt Labor Cost per Ton', calculatedValues.dirtLaborCostPerTon, 'base', setBaseArea),
                renderDisplayRow('Dirt Out Labor Cost', calculatedValues.dirtOutLaborCost, 'base', setBaseArea),
                renderDisplayRow('Total Cost', calculatedValues.baseTotalCost, 'base', setBaseArea)
              ].map((row) => (
                shouldShowRow(row.props.label, 'base') ? row : null
              ))}
            </View>
          </View>

          {/* Driveway Widening Add On Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Driveway Widening Add On" section="driveway" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', drivewayArea, 'driveway', setDrivewayArea),
                renderDisplayRow('Asphalt Thickness', calculatedValues.asphaltThickness, 'driveway', setDrivewayArea),
                renderDisplayRow('Asphalt Volume', calculatedValues.driveAsphaltVolume, 'driveway', setDrivewayArea),
                renderDisplayRow('Additional Asphalt', drivewayAdditionalAsphalt, 'driveway', setDrivewayAdditionalAsphalt),
                renderDisplayRow('Asphalt Tons', calculatedValues.driveAsphaltTons, 'driveway', setDrivewayArea),
                renderDisplayRow('Extra Asphalt (5%)', calculatedValues.driveExtraAsphalt, 'driveway', setDrivewayAdditionalAsphalt),
                renderDisplayRow('Total Asphalt Tons', calculatedValues.driveTotalAsphaltTons, 'driveway', setDrivewayArea),
                renderDisplayRow('Price per Ton', calculatedValues.pricePerTon, 'driveway', setDrivewayArea),
                renderDisplayRow('Asphalt Cost', calculatedValues.driveAsphaltCost, 'driveway', setDrivewayArea),
                renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'driveway', setDrivewayArea),
                renderDisplayRow('Asphalt Trucking In Cost', calculatedValues.driveTruckingInCost, 'driveway', setDrivewayArea),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.laborCostPerTon, 'driveway', setDrivewayArea),
                renderDisplayRow('Installation Labor Cost', calculatedValues.driveInstallationLaborCost, 'driveway', setDrivewayArea),
                renderDisplayRow('Base Thickness', calculatedValues.baseThickness, 'driveway', setDrivewayArea),
                renderDisplayRow('Base Volume', calculatedValues.driveBaseVolume, 'driveway', setDrivewayArea),
                renderDisplayRow('Additional Base', drivewayAdditionalBase, 'driveway', setDrivewayAdditionalBase),
                renderDisplayRow('Base Tons', calculatedValues.driveBaseTons, 'driveway', setDrivewayArea),
                renderDisplayRow('Extra Base (5%)', calculatedValues.driveExtraBase, 'driveway', setDrivewayAdditionalBase),
                renderDisplayRow('Total Base Tons', calculatedValues.driveTotalBaseTons, 'driveway', setDrivewayArea),
                renderDisplayRow('Base Price per Ton', calculatedValues.basePricePerTon, 'driveway', setDrivewayArea),
                renderDisplayRow('Base Cost', calculatedValues.driveBaseCost, 'driveway', setDrivewayArea),
                renderDisplayRow('Base Trucking In Cost per Ton', calculatedValues.baseTruckingInCostPerTon, 'driveway', setDrivewayArea),
                renderDisplayRow('Base Trucking In Cost', calculatedValues.driveBaseTruckingInCost, 'driveway', setDrivewayArea),
                renderDisplayRow('Base Labor Cost per Ton', calculatedValues.baseLaborCostPerTon, 'driveway', setDrivewayArea),
                renderDisplayRow('Base Labor Cost', calculatedValues.driveBaseLaborCost, 'driveway', setDrivewayArea),
                renderDisplayRow('Dirt Excavation Thickness', calculatedValues.driveDirtExcavationThickness, 'driveway', setDrivewayArea),
                renderDisplayRow('Dirt Volume', calculatedValues.driveDirtVolume, 'driveway', setDrivewayArea),
                renderDisplayRow('Dirt Tons', calculatedValues.driveDirtTons, 'driveway', setDrivewayArea),
                renderDisplayRow('Extra Dirt (5%)', calculatedValues.driveDirtExtra, 'driveway', setDrivewayArea),
                renderDisplayRow('Total Dirt Tons', calculatedValues.driveTotalDirtTons, 'driveway', setDrivewayArea),
                renderDisplayRow('Dirt Trucking Out Cost per Ton', calculatedValues.dirtTruckingOutCostPerTon, 'driveway', setDrivewayArea),
                renderDisplayRow('Dirt Trucking Out Cost', calculatedValues.driveDirtTruckingOutCost, 'driveway', setDrivewayArea),
                renderDisplayRow('Dirt Labor Cost per Ton', calculatedValues.dirtLaborCostPerTon, 'driveway', setDrivewayArea),
                renderDisplayRow('Dirt Out Labor Cost', calculatedValues.driveDirtOutLaborCost, 'driveway', setDrivewayArea),
                renderDisplayRow('Only Asphalt Portion Added to Driveway?', onlyAsphaltAdded, 'driveway', setOnlyAsphaltAdded),
                renderDisplayRow('Added Portion Mobilization Fee', calculatedValues.addedPortionMobilizationFee, 'driveway', setOnlyAsphaltAdded),
                renderDisplayRow('Total Cost', calculatedValues.drivewayTotalCost, 'driveway', setDrivewayArea)
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
                      parseFloat(calculatedValues.asphaltTotalCost.replace(/,/g, '')) +
                      parseFloat(calculatedValues.additionalInchTotalCost.replace(/,/g, '')) +
                      parseFloat(calculatedValues.baseTotalCost.replace(/,/g, '')) +
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
              
              {/* Asphalt Section */}
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
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Flat Rate Mobilization Fee ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.flatRateMobilizationFee}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, flatRateMobilizationFee: text }))}
                  keyboardType="numeric"
                />
              </View>

              {/* Base Section */}
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
                <ThemedText style={styles.modalInputLabel}>Base Trucking In Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.baseTruckingInCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, baseTruckingInCostPerTon: text }))}
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

              {/* Dirt Section */}
              <ThemedText style={styles.modalSectionTitle}>Dirt Settings</ThemedText>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Base Dirt Excavation Thickness (inches)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.dirtExcavationThickness}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, dirtExcavationThickness: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Dirt Trucking Out Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.dirtTruckingOutCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, dirtTruckingOutCostPerTon: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Dirt Labor Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.dirtLaborCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, dirtLaborCostPerTon: text }))}
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

// Styles for the component - organized by purpose
const styles = StyleSheet.create({
  // Layout containers
  container: {
    flex: 1,                    // Take up all available space
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 100,         // Extra padding for better scrolling experience
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
    backgroundColor: 'rgba(255, 0, 0, 0.1)',      // Light red for input rows
  },
  rowOdd: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',  // Light grey for regular rows
  },
  costRow: {
    backgroundColor: 'rgba(128, 128, 128, 0.25)', // Darker grey for cost rows
  },
  totalRow: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',      // Red background for total cost
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

  // Address section styling
  addressContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  addressText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,               // Slightly faded text for address
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: '#FF0000',
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
}); 