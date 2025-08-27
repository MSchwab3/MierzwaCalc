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
  section?: 'grade' | 'base' | 'driveway' | 'total';
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
    if (label === 'Base Tons' || label === 'Extra Base (5%)' || label === 'Total Base Tons' ||
        label === 'Dirt Tons' || label === 'Extra Dirt (5%)' || label === 'Total Dirt Tons') return ' tons';
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
                {(label === 'Additional Base') && <ThemedText style={styles.unitLabel}>tons</ThemedText>}
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

export default function GradePaveBaseScreen() {
  // Add ScrollView reference
  const scrollViewRef = useRef<ScrollView>(null);

  // Add state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    grade: false,
    base: false,
    driveway: false
  });

  // Function to reset all inputs
  const handleNewQuote = () => {
    // Reset all input states
    setGradeArea('');
    setGradeAdditionalBase('');
    setDistance('');
    setBaseArea('');
    setBaseAdditional('');
    setDrivewayArea('');
    setDrivewayAdditionalAsphalt('');
    setDrivewayAdditionalBase('');
    setOnlyBaseAdded('No');
    setCommissionAmount('');

    // Scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Function to toggle section expansion
  const toggleSection = (section: 'grade' | 'base' | 'driveway') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Section Title component with toggle button
  const SectionTitle = ({ title, section }: { title: string, section: 'grade' | 'base' | 'driveway' }) => (
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
  // Grade & Pave inputs
  const [gradeArea, setGradeArea] = useState('');           // Total area in square feet
  const [gradeAdditionalBase, setGradeAdditionalBase] = useState('');  // Additional base in tons
  const [distance, setDistance] = useState('');             // Distance in miles
  
  // Base Replacement inputs
  const [baseArea, setBaseArea] = useState('');           // Total area in square feet
  const [baseAdditional, setBaseAdditional] = useState(''); // Additional base in tons

  // Driveway inputs
  const [drivewayArea, setDrivewayArea] = useState('');    // Driveway area in square feet
  const [drivewayAdditionalAsphalt, setDrivewayAdditionalAsphalt] = useState(''); // Additional asphalt for driveway
  const [drivewayAdditionalBase, setDrivewayAdditionalBase] = useState(''); // Additional base for driveway
  const [onlyBaseAdded, setOnlyBaseAdded] = useState('No'); // Whether only base is added to driveway

  // Total Cost section inputs
  const [commissionAmount, setCommissionAmount] = useState(''); // Commission amount

  // Modal state
  const [isDefaultValuesModalVisible, setIsDefaultValuesModalVisible] = useState(false);
  const [tempDefaultValues, setTempDefaultValues] = useState({
    pricePerTon: '100',
    truckingInCostPerTon: '10',
    truckingOutCostPerTon: '15',
    gradeLaborCostPerTon: '8',
    basePricePerTon: '17',
    baseLaborCostPerTon: '15',
    removalLaborCostPerTon: '38'
  });

  // Function to save default values to AsyncStorage
  const saveDefaultValues = async (values: typeof tempDefaultValues) => {
    try {
      await AsyncStorage.setItem('gradePaveBaseDefaults', JSON.stringify(values));
    } catch (error) {
      console.error('Error saving default values:', error);
    }
  };

  // Function to load default values from AsyncStorage
  const loadDefaultValues = async () => {
    try {
      const savedValues = await AsyncStorage.getItem('gradePaveBaseDefaults');
      if (savedValues) {
        const parsedValues = JSON.parse(savedValues);
        setCalculatedValues(prev => ({
          ...prev,
          pricePerTon: parsedValues.pricePerTon,
          truckingInCostPerTon: parsedValues.truckingInCostPerTon,
          truckingOutCostPerTon: parsedValues.truckingOutCostPerTon,
          gradeLaborCostPerTon: parsedValues.gradeLaborCostPerTon,
          basePricePerTon: parsedValues.basePricePerTon,
          baseLaborCostPerTon: parsedValues.baseLaborCostPerTon,
          removalLaborCostPerTon: parsedValues.removalLaborCostPerTon
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
      gradeLaborCostPerTon: tempDefaultValues.gradeLaborCostPerTon,
      basePricePerTon: tempDefaultValues.basePricePerTon,
      baseLaborCostPerTon: tempDefaultValues.baseLaborCostPerTon,
      removalLaborCostPerTon: tempDefaultValues.removalLaborCostPerTon
    }));

    // Save to AsyncStorage
    await saveDefaultValues(tempDefaultValues);
    
    setIsDefaultValuesModalVisible(false);
  };

  // Calculated values state
  const [calculatedValues, setCalculatedValues] = useState({
    // Grade & Pave values
    asphaltThickness: '3',          // Default thickness in inches
    asphaltVolume: '0',             // Volume in cubic feet
    asphaltTons: '0',               // Base tonnage before waste
    extraAsphalt: '0',              // Additional 5% for waste
    totalAsphaltTons: '0',          // Total tonnage including waste
    pricePerTon: '100',             // Base price per ton of asphalt
    asphaltCost: '0',               // Total material cost
    truckingInCostPerTon: '10',     // Cost per ton for delivery
    truckingOutCostPerTon: '15',    // Cost per ton for removal
    removalLaborCostPerTon: '38',    // Labor cost per ton for removal
    truckingInCost: '0',            // Total delivery cost
    laborCostPerTon: '0',           // Labor cost per ton (varies by area)
    installationLaborCost: '0',      // Installation labor cost
    pavingMobilizationCost: '0',    // Variable based on area size
    gradeLaborCostPerTon: '8',      // Grade labor cost per ton
    gradeLaborCost: '0',            // Grade labor cost
    flatRateMobilizationFee: '200', // Base mobilization fee
    installationMileageCost: '0',   // Additional cost for distance > 10 miles
    removalMileageCost: '0',        // Additional cost for distance > 10 miles
    gradeTotalCost: '0',            // Total cost for grade section

    // Base Replacement values
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
    dirtExcavationThickness: '6',  // Default thickness in inches
    dirtVolume: '0',              // Volume in cubic feet
    dirtTons: '0',                // Base tonnage before waste
    extraDirt: '0',               // Additional 5% for waste
    totalDirtTons: '0',           // Total tonnage including waste


    dirtTruckingOutCost: '0',     // Total removal transport cost
    dirtOutLaborCost: '0',        // Total removal labor cost
    baseReplacementTotalCost: '0',  // Total cost for base section

    // Driveway values
    drivewayAsphaltThickness: '3',     // Default thickness in inches
    drivewayAsphaltVolume: '0',        // Volume in cubic feet
    drivewayAsphaltTons: '0',          // Base tonnage before waste
    drivewayExtraAsphalt: '0',         // Additional 5% for waste
    drivewayTotalAsphaltTons: '0',     // Total tonnage including waste
    drivewayAsphaltCost: '0',          // Total material cost
    drivewayLaborCostPerTon: '0',      // Labor cost per ton (varies by area)
    drivewayLaborCost: '0',            // Installation labor cost
    drivewayTruckingInCost: '0',       // Total delivery cost
    drivewayBaseThickness: '6',        // Default thickness in inches
    drivewayBaseVolume: '0',           // Volume in cubic feet
    drivewayBaseTons: '0',             // Base tonnage before waste
    drivewayExtraBase: '0',            // Additional 5% for waste
    drivewayTotalBaseTons: '0',        // Total tonnage including waste
    drivewayBaseCost: '0',             // Total material cost
    drivewayBaseTruckingInCost: '0',   // Total delivery cost
    drivewayBaseLaborCost: '0',        // Total labor cost
    drivewayDirtThickness: '9',        // Default thickness in inches
    drivewayDirtVolume: '0',           // Volume in cubic feet
    drivewayDirtTons: '0',             // Base tonnage before waste
    drivewayExtraDirt: '0',            // Additional 5% for waste
    drivewayTotalDirtTons: '0',        // Total tonnage including waste
    drivewayDirtTruckingOutCost: '0',  // Total removal transport cost
    drivewayDirtOutLaborCost: '0',     // Total removal labor cost
    drivewayAddedPortionMobilizationFee: '0', // Fee when only base is added
    drivewayTotalCost: '0',            // Total cost for driveway section
  });

  // Function to render display rows
  const renderDisplayRow = React.useCallback((label: string, value: string, section: DisplayRowProps['section'], handler?: (text: string) => void) => {
    const isInputRow = label === 'Total Area' || 
                      label === 'Additional Base' ||
                      label === 'Additional Asphalt' ||
                      label === 'Distance' ||
                      label === 'Commission Amount';

    const isCostRow = [
      'Total Asphalt Tons',
      'Asphalt Cost',
      'Trucking In Cost',
      'Paving Mobilization Cost',
      'Installation Labor Cost',
      'Grade Labor Cost',
      'Total Base Tons',
      'Base Cost',
              'Base Trucking In Cost',
        'Base Labor Cost',
        'Dirt Trucking Out Cost',
        'Dirt Out Labor Cost',
        'Grading Cost',
        'Paving Cost',
      'Mobilization Cost',
      'Flat Rate Mobilization Fee',
      'Installation Mileage Cost',
      'Only Base Portion Added to Driveway?',
      'Added Portion Mobilization Fee',
      'Total Cost',
    ].includes(label);

    const isSelectionRow = label === 'Only Base Portion Added to Driveway?';

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
        onlyAsphaltAdded={onlyBaseAdded}
        setOnlyAsphaltAdded={setOnlyBaseAdded}
      />
    );
  }, [onlyBaseAdded]);

  // Effect hook to recalculate values when inputs change
  useEffect(() => {
    const calculateValues = () => {
      // Parse input values with fallback to 0
      const area = parseFloat(gradeArea) || 0;
      const thickness = parseFloat(calculatedValues.asphaltThickness) || 0;
      const additionalTons = parseFloat(gradeAdditionalBase) || 0;

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
      const gradeLaborCost = finalTotalTons * parseFloat(calculatedValues.gradeLaborCostPerTon);

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

      // Base Replacement calculations
      const baseAreaValue = parseFloat(baseArea) || 0;
      const baseThickness = parseFloat(calculatedValues.baseThickness) || 0;
      const baseThicknessInFeet = baseThickness / 12;
      const baseVolume = baseAreaValue * baseThicknessInFeet;
      const baseTons = (baseVolume * 100) / 2000;
      const additionalBaseTons = parseFloat(baseAdditional) || 0;
      const totalBaseTons = baseTons + additionalBaseTons;
      const extraBase = totalBaseTons * 0.05;
      const finalBaseTons = Math.ceil(totalBaseTons + extraBase);

      const baseCost = finalBaseTons * parseFloat(calculatedValues.basePricePerTon);
      const baseTruckingInCost = finalBaseTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const baseLaborCost = finalBaseTons * parseFloat(calculatedValues.baseLaborCostPerTon);

      // Dirt calculations
      const dirtThickness = parseFloat(calculatedValues.dirtExcavationThickness) || 0;
      const dirtVolume = (baseAreaValue * dirtThickness) / 12;
      const dirtTons = (dirtVolume * 100) / 2000;
      const extraDirt = dirtTons * 0.05;
      const totalDirtTons = Math.ceil(dirtTons + extraDirt);

      const dirtTruckingOutCost = totalDirtTons * parseFloat(calculatedValues.truckingOutCostPerTon);
      const dirtOutLaborCost = totalDirtTons * parseFloat(calculatedValues.removalLaborCostPerTon);

      const baseReplacementTotalCost = baseCost + 
                                     baseTruckingInCost + 
                                     baseLaborCost + 
                                     dirtTruckingOutCost + 
                                     dirtOutLaborCost;

      // Driveway Widening Add On calculations
      const drivewayAreaValue = parseFloat(drivewayArea) || 0;
      
      // Asphalt calculations
      const drivewayAsphaltThickness = 3;
      const drivewayAsphaltVolume = (drivewayAreaValue * drivewayAsphaltThickness) / 12;
      const drivewayAsphaltTons = (drivewayAsphaltVolume * 145) / 2000;
      const drivewayAdditionalAsphaltValue = parseFloat(drivewayAdditionalAsphalt) || 0;
      const totalDrivewayAsphaltTons = drivewayAsphaltTons + drivewayAdditionalAsphaltValue;
      const drivewayExtraAsphalt = totalDrivewayAsphaltTons * 0.05;
      const finalDrivewayAsphaltTons = Math.ceil(totalDrivewayAsphaltTons + drivewayExtraAsphalt);

      const drivewayAsphaltCost = finalDrivewayAsphaltTons * parseFloat(calculatedValues.pricePerTon);
      const drivewayLaborCostPerTon = drivewayAreaValue <= 5000 ? 50 : 45;
      const drivewayLaborCost = finalDrivewayAsphaltTons * drivewayLaborCostPerTon;
      const drivewayTruckingInCost = finalDrivewayAsphaltTons * parseFloat(calculatedValues.truckingInCostPerTon);

      // Base calculations
      const drivewayBaseThickness = 6;
      const drivewayBaseVolume = (drivewayAreaValue * drivewayBaseThickness) / 12;
      const drivewayBaseTons = (drivewayBaseVolume * 100) / 2000;
      const drivewayAdditionalBaseValue = parseFloat(drivewayAdditionalBase) || 0;
      const totalDrivewayBaseTons = drivewayBaseTons + drivewayAdditionalBaseValue;
      const drivewayExtraBase = totalDrivewayBaseTons * 0.05;
      const finalDrivewayBaseTons = Math.ceil(totalDrivewayBaseTons + drivewayExtraBase);

      const drivewayBaseCost = finalDrivewayBaseTons * parseFloat(calculatedValues.basePricePerTon);
      const drivewayBaseTruckingInCost = finalDrivewayBaseTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const drivewayBaseLaborCost = finalDrivewayBaseTons * parseFloat(calculatedValues.baseLaborCostPerTon);

      // Dirt calculations
      const drivewayDirtThickness = 9;
      const drivewayDirtVolume = (drivewayAreaValue * drivewayDirtThickness) / 12;
      const drivewayDirtTons = (drivewayDirtVolume * 100) / 2000;
      const drivewayExtraDirt = drivewayDirtTons * 0.05;
      const finalDrivewayDirtTons = Math.ceil(drivewayDirtTons + drivewayExtraDirt);

      const drivewayDirtTruckingOutCost = finalDrivewayDirtTons * parseFloat(calculatedValues.truckingOutCostPerTon);
      const drivewayDirtOutLaborCost = finalDrivewayDirtTons * parseFloat(calculatedValues.removalLaborCostPerTon);

      // Calculate added portion mobilization fee based on selection
      const addedPortionMobilizationFee = onlyBaseAdded === 'Yes' ? 750 : 0;

      // Calculate total cost for driveway section
      const drivewayTotalCost = drivewayAsphaltCost +
                               drivewayLaborCost +
                               drivewayTruckingInCost +
                               drivewayBaseCost +
                               drivewayBaseTruckingInCost +
                               drivewayBaseLaborCost +
                               drivewayDirtTruckingOutCost +
                               drivewayDirtOutLaborCost +
                               addedPortionMobilizationFee;

      // Calculate total cost for grade section
      const gradeTotalCost = area === 0 ? 0 : asphaltCost + 
                           truckingInCost + 
                           installationLaborCost + 
                           gradeLaborCost +
                           pavingMobilizationCost + 
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
        gradeLaborCost: gradeLaborCost.toFixed(2),
        installationMileageCost: installationMileageCost.toFixed(2),
        removalMileageCost: removalMileageCost.toFixed(2),
        gradeTotalCost: gradeTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        // Base Replacement values
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
          baseReplacementTotalCost: baseReplacementTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

          // Driveway Asphalt values
          drivewayAsphaltVolume: drivewayAsphaltVolume.toFixed(2),
          drivewayAsphaltTons: totalDrivewayAsphaltTons.toFixed(2),
          drivewayExtraAsphalt: drivewayExtraAsphalt.toFixed(2),
          drivewayTotalAsphaltTons: finalDrivewayAsphaltTons.toString(),
          drivewayAsphaltCost: drivewayAsphaltCost.toFixed(2),
          drivewayLaborCostPerTon: drivewayLaborCostPerTon.toString(),
          drivewayLaborCost: drivewayLaborCost.toFixed(2),
          drivewayTruckingInCost: drivewayTruckingInCost.toFixed(2),

          // Driveway Base values
          drivewayBaseVolume: drivewayBaseVolume.toFixed(2),
          drivewayBaseTons: totalDrivewayBaseTons.toFixed(2),
          drivewayExtraBase: drivewayExtraBase.toFixed(2),
          drivewayTotalBaseTons: finalDrivewayBaseTons.toString(),
          drivewayBaseCost: drivewayBaseCost.toFixed(2),
          drivewayBaseTruckingInCost: drivewayBaseTruckingInCost.toFixed(2),
          drivewayBaseLaborCost: drivewayBaseLaborCost.toFixed(2),

          // Driveway Dirt values
          drivewayDirtVolume: drivewayDirtVolume.toFixed(2),
          drivewayDirtTons: drivewayDirtTons.toFixed(2),
          drivewayExtraDirt: drivewayExtraDirt.toFixed(2),
          drivewayTotalDirtTons: finalDrivewayDirtTons.toString(),
          drivewayDirtTruckingOutCost: drivewayDirtTruckingOutCost.toFixed(2),
          drivewayDirtOutLaborCost: drivewayDirtOutLaborCost.toFixed(2),
          drivewayAddedPortionMobilizationFee: addedPortionMobilizationFee.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
          drivewayTotalCost: drivewayTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }));
    };

    calculateValues();
  }, [gradeArea, gradeAdditionalBase, distance,
      baseArea, baseAdditional,
      drivewayArea, drivewayAdditionalAsphalt, drivewayAdditionalBase, onlyBaseAdded,
      calculatedValues.asphaltThickness, calculatedValues.pricePerTon,
      calculatedValues.truckingInCostPerTon, calculatedValues.gradeLaborCostPerTon,
      calculatedValues.flatRateMobilizationFee,
      calculatedValues.baseThickness, calculatedValues.basePricePerTon,
      calculatedValues.baseLaborCostPerTon, calculatedValues.dirtExcavationThickness,
      calculatedValues.truckingOutCostPerTon, calculatedValues.removalLaborCostPerTon]);

  // Helper function to determine if a row should be shown
  const shouldShowRow = (label: string, section: 'grade' | 'base' | 'driveway' | 'total') => {
    if (section === 'total') return true;  // Always show total section rows
    const isExpanded = expandedSections[section];
    const isCostRow = [
      'Total Asphalt Tons',
      'Asphalt Cost',
      'Trucking In Cost',
      'Paving Mobilization Cost',
      'Installation Labor Cost',
      'Grade Labor Cost',
      'Total Base Tons',
      'Base Cost',
              'Base Trucking In Cost',
        'Base Labor Cost',
        'Dirt Trucking Out Cost',
        'Dirt Out Labor Cost',
        'Grading Cost',
        'Paving Cost',
      'Mobilization Cost',
      'Flat Rate Mobilization Fee',
      'Installation Mileage Cost',
      'Only Base Portion Added to Driveway?',
      'Added Portion Mobilization Fee',
      'Total Cost',
    ].includes(label);
    
    const isInputRow = label === 'Total Area' || label === 'Distance';
    const isHiddenInput = label === 'Additional Base' || label === 'Additional Asphalt';
    const isSelectionRow = label === 'Only Base Portion Added to Driveway?';
    
    // Always show cost rows, input rows, selection rows, and total cost, hide others when collapsed
    if (isHiddenInput) return isExpanded;
    return isExpanded || isCostRow || isInputRow || isSelectionRow || label === 'Total Cost';
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Grade Pave Base Replacement' }} />
      
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
                  gradeLaborCostPerTon: calculatedValues.gradeLaborCostPerTon,
                  basePricePerTon: calculatedValues.basePricePerTon,
                  baseLaborCostPerTon: calculatedValues.baseLaborCostPerTon,
                  removalLaborCostPerTon: calculatedValues.removalLaborCostPerTon
                });
                setIsDefaultValuesModalVisible(true);
              }}
            >
              <ThemedText style={styles.defaultValuesButtonText}>Change Default Values</ThemedText>
            </Pressable>
          </View>

          {/* Grade & Pave Existing Base Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Grade & Pave Existing Base" section="grade" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', gradeArea, 'grade', setGradeArea),
                renderDisplayRow('Asphalt Thickness', calculatedValues.asphaltThickness, 'grade'),
                renderDisplayRow('Asphalt Volume', calculatedValues.asphaltVolume, 'grade'),
                renderDisplayRow('Additional Asphalt', gradeAdditionalBase, 'grade', setGradeAdditionalBase),
                renderDisplayRow('Asphalt Tons', calculatedValues.asphaltTons, 'grade'),
                renderDisplayRow('Extra Asphalt (5%)', calculatedValues.extraAsphalt, 'grade'),
                renderDisplayRow('Total Asphalt Tons', calculatedValues.totalAsphaltTons, 'grade'),
                renderDisplayRow('Price Per Ton', calculatedValues.pricePerTon, 'grade'),
                renderDisplayRow('Asphalt Cost', calculatedValues.asphaltCost, 'grade'),
                renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'grade'),
                renderDisplayRow('Trucking In Cost', calculatedValues.truckingInCost, 'grade'),
                renderDisplayRow('Paving Mobilization Cost', calculatedValues.pavingMobilizationCost, 'grade'),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.laborCostPerTon, 'grade'),
                renderDisplayRow('Installation Labor Cost', calculatedValues.installationLaborCost, 'grade'),
                renderDisplayRow('Grade Labor Cost per Ton', calculatedValues.gradeLaborCostPerTon, 'grade'),
                renderDisplayRow('Grade Labor Cost', calculatedValues.gradeLaborCost, 'grade'),
                renderDisplayRow('Flat Rate Mobilization Fee', calculatedValues.flatRateMobilizationFee, 'grade'),
                renderDisplayRow('Distance', distance, 'grade', setDistance),
                renderDisplayRow('Installation Mileage Cost', calculatedValues.installationMileageCost, 'grade'),
                renderDisplayRow('Removal Mileage Cost', calculatedValues.removalMileageCost, 'grade'),
                renderDisplayRow('Total Cost', calculatedValues.gradeTotalCost, 'grade')
              ].map((row) => (
                shouldShowRow(row.props.label, 'grade') ? row : null
              ))}
            </View>
          </View>

          {/* Existing Base Replacement Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Existing Base Replacement" section="base" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', baseArea, 'base', setBaseArea),
                renderDisplayRow('Base Thickness', calculatedValues.baseThickness, 'base'),
                renderDisplayRow('Base Volume', calculatedValues.baseVolume, 'base'),
                renderDisplayRow('Additional Base', baseAdditional, 'base', setBaseAdditional),
                renderDisplayRow('Base Tons', calculatedValues.baseTons, 'base'),
                renderDisplayRow('Extra Base (5%)', calculatedValues.extraBase, 'base'),
                renderDisplayRow('Total Base Tons', calculatedValues.totalBaseTons, 'base'),
                renderDisplayRow('Price per Ton', calculatedValues.basePricePerTon, 'base'),
                renderDisplayRow('Base Cost', calculatedValues.baseCost, 'base'),
                renderDisplayRow('Base Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'base'),
                renderDisplayRow('Base Trucking In Cost', calculatedValues.baseTruckingInCost, 'base'),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.baseLaborCostPerTon, 'base'),
                renderDisplayRow('Base Labor Cost', calculatedValues.baseLaborCost, 'base'),
                renderDisplayRow('Dirt Excavation Thickness', calculatedValues.dirtExcavationThickness, 'base'),
                renderDisplayRow('Dirt Volume', calculatedValues.dirtVolume, 'base'),
                renderDisplayRow('Dirt Tons', calculatedValues.dirtTons, 'base'),
                renderDisplayRow('Extra Dirt (5%)', calculatedValues.extraDirt, 'base'),
                renderDisplayRow('Total Dirt Tons', calculatedValues.totalDirtTons, 'base'),
                renderDisplayRow('Dirt Trucking Out Cost per Ton', calculatedValues.truckingOutCostPerTon, 'base'),
                renderDisplayRow('Dirt Trucking Out Cost', calculatedValues.dirtTruckingOutCost, 'base'),
                renderDisplayRow('Dirt Labor Cost per Ton', calculatedValues.removalLaborCostPerTon, 'base'),
                renderDisplayRow('Dirt Out Labor Cost', calculatedValues.dirtOutLaborCost, 'base'),
                renderDisplayRow('Total Cost', calculatedValues.baseReplacementTotalCost, 'base')
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
                 renderDisplayRow('Asphalt Thickness', calculatedValues.drivewayAsphaltThickness, 'driveway'),
                 renderDisplayRow('Asphalt Volume', calculatedValues.drivewayAsphaltVolume, 'driveway'),
                 renderDisplayRow('Additional Asphalt', drivewayAdditionalAsphalt, 'driveway', setDrivewayAdditionalAsphalt),
                 renderDisplayRow('Asphalt Tons', calculatedValues.drivewayAsphaltTons, 'driveway'),
                 renderDisplayRow('Extra Asphalt (5%)', calculatedValues.drivewayExtraAsphalt, 'driveway'),
                 renderDisplayRow('Total Asphalt Tons', calculatedValues.drivewayTotalAsphaltTons, 'driveway'),
                 renderDisplayRow('Price Per Ton', calculatedValues.pricePerTon, 'driveway'),
                 renderDisplayRow('Asphalt Cost', calculatedValues.drivewayAsphaltCost, 'driveway'),
                 renderDisplayRow('Labor Cost per Ton', calculatedValues.drivewayLaborCostPerTon, 'driveway'),
                 renderDisplayRow('Installation Labor Cost', calculatedValues.drivewayLaborCost, 'driveway'),
                 renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'driveway'),
                 renderDisplayRow('Trucking In Cost', calculatedValues.drivewayTruckingInCost, 'driveway'),
                 renderDisplayRow('Base Thickness', calculatedValues.drivewayBaseThickness, 'driveway'),
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
                 renderDisplayRow('Dirt Trucking Out Cost per Ton', calculatedValues.truckingOutCostPerTon, 'driveway'),
                                 renderDisplayRow('Dirt Trucking Out Cost', calculatedValues.drivewayDirtTruckingOutCost, 'driveway'),
                renderDisplayRow('Dirt Labor Cost per Ton', calculatedValues.removalLaborCostPerTon, 'driveway'),
                renderDisplayRow('Dirt Out Labor Cost', calculatedValues.drivewayDirtOutLaborCost, 'driveway'),
                renderDisplayRow('Only Base Portion Added to Driveway?', onlyBaseAdded, 'driveway'),
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
                      parseFloat(calculatedValues.gradeTotalCost.replace(/,/g, '')) +
                      parseFloat(calculatedValues.baseReplacementTotalCost.replace(/,/g, '')) +
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
                <ThemedText style={styles.modalInputLabel}>Grade Labor Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.gradeLaborCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, gradeLaborCostPerTon: text }))}
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

              {/* Dirt Settings */}
              <ThemedText style={styles.modalSectionTitle}>Dirt Settings</ThemedText>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Removal Labor Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.removalLaborCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, removalLaborCostPerTon: text }))}
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