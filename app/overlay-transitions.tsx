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
  section?: 'overlay' | 'additionalInch' | 'transition' | 'driveway' | 'total';
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
      isCostRow || isSelectionRow ? styles.costRow :
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

export default function OverlayTransitionsScreen() {
  // Add ScrollView reference
  const scrollViewRef = useRef<ScrollView>(null);

  // Add state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    overlay: false,
    additionalInch: false,
    transition: false,
    driveway: false
  });

  // Function to reset all inputs
  const handleNewQuote = () => {
    // Reset all input states
    setOverlayArea('');
    setOverlayAdditional('');
    setDistance('');
    setAdditionalInchArea('');
    setAdditionalInchAsphalt('');
    setAdditionalInchThickness('');
    setTransitionArea('');
    setTransitionAdditional('');
    setDrivewayArea('');
    setDrivewayAdditionalAsphalt('');
    setDrivewayAdditionalBase('');
    setOnlyAsphaltAdded('No');
    setCommissionAmount('');

    // Scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Function to toggle section expansion
  const toggleSection = (section: 'overlay' | 'additionalInch' | 'transition' | 'driveway') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Function to save default values to AsyncStorage
  const saveDefaultValues = async (values: typeof tempDefaultValues) => {
    try {
      await AsyncStorage.setItem('overlayTransitionsDefaults', JSON.stringify(values));
    } catch (error) {
      console.error('Error saving default values:', error);
    }
  };

  // Function to load default values from AsyncStorage
  const loadDefaultValues = async () => {
    try {
      const savedValues = await AsyncStorage.getItem('overlayTransitionsDefaults');
      if (savedValues) {
        const parsedValues = JSON.parse(savedValues);
        setCalculatedValues(prev => ({
          ...prev,
          pricePerTon: parsedValues.pricePerTon,
          truckingInCostPerTon: parsedValues.truckingInCostPerTon,
          truckingOutCostPerTon: parsedValues.truckingOutCostPerTon,
          removalLaborCostPerTon: parsedValues.removalLaborCostPerTon,
          tackCoatFee: parsedValues.tackCoatFee,
          preparationFee: parsedValues.preparationFee,
          drivewayBasePricePerTon: parsedValues.drivewayBasePricePerTon,
          drivewayBaseLaborCostPerTon: parsedValues.drivewayBaseLaborCostPerTon
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
    tackCoatFee: '100',
    preparationFee: '200',
    drivewayBasePricePerTon: '17',
    drivewayBaseLaborCostPerTon: '15'
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
      tackCoatFee: tempDefaultValues.tackCoatFee,
      preparationFee: tempDefaultValues.preparationFee,
      drivewayBasePricePerTon: tempDefaultValues.drivewayBasePricePerTon,
      drivewayBaseLaborCostPerTon: tempDefaultValues.drivewayBaseLaborCostPerTon
    }));

    // Save to AsyncStorage
    await saveDefaultValues(tempDefaultValues);
    
    setIsDefaultValuesModalVisible(false);
  };

  // State for driveway selection
  const [onlyAsphaltAdded, setOnlyAsphaltAdded] = useState('No'); // Whether only asphalt is added to driveway

  // Function to render display rows
  const renderDisplayRow = React.useCallback((label: string, value: string, section: DisplayRowProps['section'], handler?: (text: string) => void) => {
    const isInputRow = label === 'Total Area' || 
                      label === 'Additional Asphalt' ||
                      label === 'Additional Base' ||
                      label === 'Distance' ||
                      label === 'Commission Amount';

    const isCostRow = [
      'Total Asphalt Tons',
      'Asphalt Cost',
      'Trucking In Cost',
      'Installation Labor Cost',
      'Paving Mobilization Cost',
      'Flat Rate Mobilization Fee',
      'Tack Coat Fee',
      'Preparation Fee',
      'Installation Mileage Cost',
      'Dirt Trucking Out Cost',
      'Removal Labor Cost',
      'Base Cost',
      'Base Trucking In Cost',
      'Base Labor Cost',
      'Dirt Out Labor Cost',
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
  }, [onlyAsphaltAdded]);

  // Helper function to determine if a row should be shown
  const shouldShowRow = (label: string, section: 'overlay' | 'additionalInch' | 'transition' | 'driveway' | 'total') => {
    if (section === 'total') return true;  // Always show total section rows
    const isExpanded = expandedSections[section];
    const isCostRow = [
      'Total Asphalt Tons',
      'Asphalt Cost',
      'Trucking In Cost',
      'Installation Labor Cost',
      'Paving Mobilization Cost',
      'Flat Rate Mobilization Fee',
      'Tack Coat Fee',
      'Preparation Fee',
      'Installation Mileage Cost',
      'Dirt Trucking Out Cost',
      'Removal Labor Cost',
      'Base Cost',
      'Base Trucking In Cost',
      'Base Labor Cost',
      'Dirt Out Labor Cost',
      'Added Portion Mobilization Fee',
      'Total Cost',
    ].includes(label);
    
    const isInputRow = label === 'Total Area' || label === 'Distance';
    const isHiddenInput = label === 'Additional Asphalt';
    const isSelectionRow = label === 'Only Asphalt Portion Added to Driveway?';
    
    // Always show cost rows, input rows, selection rows, and total cost, hide others when collapsed
    if (isHiddenInput) return isExpanded;
    return isExpanded || isCostRow || isInputRow || isSelectionRow || label === 'Total Cost';
  };

  // Section Title component with toggle button
  const SectionTitle = ({ title, section }: { title: string, section: 'overlay' | 'additionalInch' | 'transition' | 'driveway' }) => (
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
  // Asphalt Overlay inputs
  const [overlayArea, setOverlayArea] = useState('');           // Total area in square feet
  const [overlayAdditional, setOverlayAdditional] = useState('');  // Additional asphalt in tons
  const [distance, setDistance] = useState('');             // Distance in miles
  
  // Additional Inch Overlay section inputs
  const [additionalInchArea, setAdditionalInchArea] = useState('');           // Total area in square feet
  const [additionalInchAsphalt, setAdditionalInchAsphalt] = useState('');     // Additional asphalt in tons
  const [additionalInchThickness, setAdditionalInchThickness] = useState(''); // Additional asphalt thickness
  
  // Asphalt Transition inputs
  const [transitionArea, setTransitionArea] = useState('');           // Total area in square feet
  const [transitionAdditional, setTransitionAdditional] = useState(''); // Additional asphalt in tons
  const [transitionDistance, setTransitionDistance] = useState('');   // Distance in miles

  // Driveway inputs
  const [drivewayArea, setDrivewayArea] = useState('');    // Driveway area in square feet
  const [drivewayAdditionalAsphalt, setDrivewayAdditionalAsphalt] = useState(''); // Additional asphalt for driveway
  const [drivewayAdditionalBase, setDrivewayAdditionalBase] = useState(''); // Additional base for driveway

  // Total Cost section inputs
  const [commissionAmount, setCommissionAmount] = useState(''); // Commission amount

  // Calculated values state
  const [calculatedValues, setCalculatedValues] = useState({
    // Asphalt Overlay values
    asphaltThickness: '1.5',          // Default thickness in inches
    asphaltVolume: '0',             // Volume in cubic feet
    asphaltTons: '0',               // Base tonnage before waste
    extraAsphalt: '0',              // Additional 5% for waste
    totalAsphaltTons: '0',          // Total tonnage including waste
    pricePerTon: '100',             // Base price per ton of asphalt
    asphaltCost: '0',               // Total material cost
    truckingInCostPerTon: '10',     // Cost per ton for delivery
    truckingOutCostPerTon: '15',    // Cost per ton for removal
    removalLaborCostPerTon: '38',   // Labor cost per ton for removal
    truckingInCost: '0',            // Total delivery cost
    laborCostPerTon: '0',           // Labor cost per ton (varies by area)
    installationLaborCost: '0',     // Installation labor cost
    pavingMobilizationCost: '0',    // Variable based on area size
    flatRateMobilizationFee: '200', // Base mobilization fee
    tackCoatFee: '100',            // Tack coat fee
    preparationFee: '200',         // Preparation fee
    installationMileageCost: '0',   // Additional cost for distance > 10 miles
    overlayTotalCost: '0',         // Total cost for overlay section

    // Asphalt Additional Inch Overlay values
    additionalInchThickness: '0.5',    // Default thickness in inches
    additionalInchVolume: '0',         // Volume in cubic feet
    additionalInchTons: '0',           // Base tonnage before waste
    additionalInchExtra: '0',          // Additional 5% for waste
    additionalInchTotalTons: '0',      // Total tonnage including waste
    additionalInchCost: '0',           // Total material cost
    additionalInchTruckingInCost: '0', // Total delivery cost
    additionalInchLaborCost: '0',      // Total installation labor cost
    additionalInchTotalCost: '0',      // Total cost for additional inch section

    // Asphalt Transition values
    transitionThickness: '2',          // Default thickness in inches
    transitionVolume: '0',             // Volume in cubic feet
    transitionTons: '0',               // Base tonnage before waste
    transitionExtraAsphalt: '0',       // Additional 5% for waste
    transitionTotalTons: '0',          // Total tonnage including waste
    transitionAsphaltCost: '0',        // Total material cost
    transitionTruckingInCost: '0',     // Total delivery cost
    transitionLaborCostPerTon: '0',    // Labor cost per ton (varies by area)
    transitionLaborCost: '0',          // Installation labor cost
    transitionTruckingOutCost: '0',    // Total removal transport cost
    transitionRemovalLaborCost: '0',   // Total removal labor cost
    transitionFlatRateMobilizationFee: '100', // Flat rate mobilization fee
    transitionRemovalMileageCost: '0', // Additional cost for distance > 10 miles
    transitionTotalCost: '0',          // Total cost for transition section

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
    drivewayBasePricePerTon: '17',     // Base price per ton
    drivewayBaseCost: '0',             // Total material cost
    drivewayBaseLaborCostPerTon: '15', // Labor cost per ton
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
  });

  // Effect hook to recalculate values when inputs change
  useEffect(() => {
    const calculateValues = () => {
      // Parse input values with fallback to 0
      const area = parseFloat(overlayArea) || 0;
      const thickness = parseFloat(calculatedValues.asphaltThickness) || 0;
      const additionalTons = parseFloat(overlayAdditional) || 0;

      // Calculate volume
      const totalThicknessInFeet = thickness / 12;
      const volume = area * totalThicknessInFeet;

      // Calculate tons
      const tons = (volume * 145) / 2000;
      const totalAsphaltTons = tons + additionalTons;
      const extraAsphalt = totalAsphaltTons * 0.05;
      const finalTotalTons = Math.ceil(totalAsphaltTons + extraAsphalt);

      // Calculate labor rate and costs
      const laborCostPerTon = area <= 5000 ? 50 : 45;
      const installationLaborCost = finalTotalTons * laborCostPerTon;

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

      // Calculate mileage costs
      const distanceValue = parseFloat(distance) || 0;
      const extraMiles = Math.max(0, distanceValue - 10);
      const installationMileageCost = extraMiles * 20;

      const asphaltCost = finalTotalTons * parseFloat(calculatedValues.pricePerTon);
      const truckingInCost = finalTotalTons * parseFloat(calculatedValues.truckingInCostPerTon);

      // Calculate total cost for overlay section
      const overlayTotalCost = area === 0 ? 0 : asphaltCost + 
                              truckingInCost + 
                              installationLaborCost + 
                              pavingMobilizationCost + 
                              parseFloat(calculatedValues.flatRateMobilizationFee) + 
                              parseFloat(calculatedValues.tackCoatFee) + 
                              parseFloat(calculatedValues.preparationFee) + 
                              installationMileageCost;

      // Calculate Additional Inch Overlay values
      const additionalInchAreaValue = parseFloat(additionalInchArea) || 0;
      const additionalInchThicknessValue = parseFloat(calculatedValues.additionalInchThickness) || 0;
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

      // Calculate total cost for additional inch section
      const additionalInchTotalCostValue = additionalInchCostValue + 
                                         additionalInchTruckingInCostValue + 
                                         additionalInchLaborCostValue;

      // Calculate Transition values
      const transitionAreaValue = parseFloat(transitionArea) || 0;
      const transitionThicknessValue = parseFloat(calculatedValues.transitionThickness) || 0;
      const transitionThicknessInFeet = transitionThicknessValue / 12;
      const transitionVolumeValue = transitionAreaValue * transitionThicknessInFeet;
      const transitionTonsValue = (transitionVolumeValue * 145) / 2000;
      const transitionAddTons = parseFloat(transitionAdditional) || 0;
      const totalTransitionTons = transitionTonsValue + transitionAddTons;
      const transitionExtraValue = totalTransitionTons * 0.05;
      const finalTransitionTons = Math.ceil(totalTransitionTons + transitionExtraValue);

      const transitionAsphaltCostValue = finalTransitionTons * parseFloat(calculatedValues.pricePerTon);
      const transitionTruckingInCostValue = finalTransitionTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const transitionLaborCostPerTon = transitionAreaValue <= 5000 ? 50 : 45;
      const transitionLaborCostValue = finalTransitionTons * transitionLaborCostPerTon;
      const transitionTruckingOutCostValue = finalTransitionTons * parseFloat(calculatedValues.truckingOutCostPerTon);
      const transitionRemovalLaborCostValue = finalTransitionTons * parseFloat(calculatedValues.removalLaborCostPerTon);

      const transitionDistanceValue = parseFloat(transitionDistance) || 0;
      const transitionExtraMiles = Math.max(0, transitionDistanceValue - 10);
      const transitionRemovalMileageCostValue = transitionExtraMiles * 10;

      const transitionTotalCostValue = transitionAreaValue === 0 ? 0 : transitionAsphaltCostValue + 
                                     transitionTruckingInCostValue + 
                                     transitionLaborCostValue +
                                     transitionTruckingOutCostValue +
                                     transitionRemovalLaborCostValue +
                                     parseFloat(calculatedValues.transitionFlatRateMobilizationFee) +
                                     transitionRemovalMileageCostValue;

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

      const drivewayBaseCostValue = finalDrivewayBaseTons * parseFloat(calculatedValues.drivewayBasePricePerTon);
      const drivewayBaseTruckingInCostValue = finalDrivewayBaseTons * parseFloat(calculatedValues.truckingInCostPerTon);
      const drivewayBaseLaborCostValue = finalDrivewayBaseTons * parseFloat(calculatedValues.drivewayBaseLaborCostPerTon);

      // Dirt calculations
      const drivewayDirtThicknessValue = parseFloat(calculatedValues.drivewayDirtThickness) || 0;
      const drivewayDirtThicknessInFeet = drivewayDirtThicknessValue / 12;
      const drivewayDirtVolumeValue = drivewayAreaValue * drivewayDirtThicknessInFeet;
      const drivewayDirtTonsValue = (drivewayDirtVolumeValue * 100) / 2000;
      const drivewayExtraDirtValue = drivewayDirtTonsValue * 0.05;
      const finalDrivewayDirtTons = Math.ceil(drivewayDirtTonsValue + drivewayExtraDirtValue);

      const drivewayDirtTruckingOutCostValue = finalDrivewayDirtTons * parseFloat(calculatedValues.truckingOutCostPerTon);
      const drivewayDirtOutLaborCostValue = finalDrivewayDirtTons * parseFloat(calculatedValues.removalLaborCostPerTon);

      // Calculate total cost for driveway section
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

      setCalculatedValues(prev => ({
        ...prev,
        asphaltVolume: volume.toFixed(2),
        asphaltTons: totalAsphaltTons.toFixed(2),
        extraAsphalt: extraAsphalt.toFixed(2),
        totalAsphaltTons: finalTotalTons.toFixed(2),
        asphaltCost: asphaltCost.toFixed(2),
        truckingInCost: truckingInCost.toFixed(2),
        laborCostPerTon: laborCostPerTon.toString(),
        installationLaborCost: installationLaborCost.toFixed(2),
        pavingMobilizationCost: pavingMobilizationCost.toString(),
        installationMileageCost: installationMileageCost.toFixed(2),
        overlayTotalCost: overlayTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        // Additional Inch values
        additionalInchVolume: additionalInchVolumeValue.toFixed(2),
        additionalInchTons: totalAdditionalInchTons.toFixed(2),
        additionalInchExtra: additionalInchExtraValue.toFixed(2),
        additionalInchTotalTons: finalAdditionalInchTons.toString(),
        additionalInchCost: additionalInchCostValue.toFixed(2),
        additionalInchTruckingInCost: additionalInchTruckingInCostValue.toFixed(2),
        additionalInchLaborCost: additionalInchLaborCostValue.toFixed(2),
        additionalInchTotalCost: additionalInchTotalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

        // Transition values
        transitionVolume: transitionVolumeValue.toFixed(2),
        transitionTons: totalTransitionTons.toFixed(2),
        transitionExtraAsphalt: transitionExtraValue.toFixed(2),
        transitionTotalTons: finalTransitionTons.toString(),
        transitionAsphaltCost: transitionAsphaltCostValue.toFixed(2),
        transitionTruckingInCost: transitionTruckingInCostValue.toFixed(2),
        transitionLaborCostPerTon: transitionLaborCostPerTon.toString(),
        transitionLaborCost: transitionLaborCostValue.toFixed(2),
        transitionTruckingOutCost: transitionTruckingOutCostValue.toFixed(2),
        transitionRemovalLaborCost: transitionRemovalLaborCostValue.toFixed(2),
        transitionRemovalMileageCost: transitionRemovalMileageCostValue.toFixed(2),
        transitionTotalCost: transitionTotalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

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
  }, [overlayArea, overlayAdditional, additionalInchArea, additionalInchAsphalt, transitionArea, transitionAdditional, transitionDistance,
      drivewayArea, drivewayAdditionalAsphalt, drivewayAdditionalBase, onlyAsphaltAdded,
      calculatedValues.asphaltThickness, calculatedValues.pricePerTon, calculatedValues.truckingInCostPerTon,
      calculatedValues.transitionThickness, calculatedValues.transitionFlatRateMobilizationFee,
      calculatedValues.truckingOutCostPerTon, calculatedValues.removalLaborCostPerTon,
      calculatedValues.drivewayAsphaltThickness, calculatedValues.drivewayBaseThickness,
      calculatedValues.drivewayBasePricePerTon, calculatedValues.drivewayBaseLaborCostPerTon,
      calculatedValues.drivewayDirtThickness, calculatedValues.truckingOutCostPerTon,
      calculatedValues.removalLaborCostPerTon]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Overlay & Transitions' }} />
      
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
                  tackCoatFee: calculatedValues.tackCoatFee,
                  preparationFee: calculatedValues.preparationFee,
                  drivewayBasePricePerTon: calculatedValues.drivewayBasePricePerTon,
                  drivewayBaseLaborCostPerTon: calculatedValues.drivewayBaseLaborCostPerTon
                });
                setIsDefaultValuesModalVisible(true);
              }}
            >
              <ThemedText style={styles.defaultValuesButtonText}>Change Default Values</ThemedText>
            </Pressable>
          </View>
          {/* Asphalt Overlay Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Asphalt Overlay" section="overlay" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', overlayArea, 'overlay', setOverlayArea),
                renderDisplayRow('Asphalt Thickness', calculatedValues.asphaltThickness, 'overlay'),
                renderDisplayRow('Asphalt Volume', calculatedValues.asphaltVolume, 'overlay'),
                renderDisplayRow('Additional Asphalt', overlayAdditional, 'overlay', setOverlayAdditional),
                renderDisplayRow('Asphalt Tons', calculatedValues.asphaltTons, 'overlay'),
                renderDisplayRow('Extra Asphalt (5%)', calculatedValues.extraAsphalt, 'overlay'),
                renderDisplayRow('Total Asphalt Tons', calculatedValues.totalAsphaltTons, 'overlay'),
                renderDisplayRow('Price Per Ton', calculatedValues.pricePerTon, 'overlay'),
                renderDisplayRow('Asphalt Cost', calculatedValues.asphaltCost, 'overlay'),
                renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'overlay'),
                renderDisplayRow('Trucking In Cost', calculatedValues.truckingInCost, 'overlay'),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.laborCostPerTon, 'overlay'),
                renderDisplayRow('Installation Labor Cost', calculatedValues.installationLaborCost, 'overlay'),
                renderDisplayRow('Paving Mobilization Cost', calculatedValues.pavingMobilizationCost, 'overlay'),
                renderDisplayRow('Flat Rate Mobilization Fee', calculatedValues.flatRateMobilizationFee, 'overlay'),
                renderDisplayRow('Tack Coat Fee', calculatedValues.tackCoatFee, 'overlay'),
                renderDisplayRow('Preparation Fee', calculatedValues.preparationFee, 'overlay'),
                renderDisplayRow('Distance', distance, 'overlay', setDistance),
                renderDisplayRow('Installation Mileage Cost', calculatedValues.installationMileageCost, 'overlay'),
                renderDisplayRow('Total Cost', calculatedValues.overlayTotalCost, 'overlay')
              ].map((row) => (
                shouldShowRow(row.props.label, 'overlay') ? row : null
              ))}
            </View>
          </View>

          {/* Asphalt Additional Inch Overlay Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Asphalt Additional Inch Overlay" section="additionalInch" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', additionalInchArea, 'additionalInch', setAdditionalInchArea),
                renderDisplayRow('Asphalt Thickness', calculatedValues.additionalInchThickness, 'additionalInch'),
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

          {/* Asphalt Transition Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Asphalt Transition" section="transition" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Total Area', transitionArea, 'transition', setTransitionArea),
                renderDisplayRow('Asphalt Thickness', calculatedValues.transitionThickness, 'transition'),
                renderDisplayRow('Asphalt Volume', calculatedValues.transitionVolume, 'transition'),
                renderDisplayRow('Additional Asphalt', transitionAdditional, 'transition', setTransitionAdditional),
                renderDisplayRow('Asphalt Tons', calculatedValues.transitionTons, 'transition'),
                renderDisplayRow('Extra Asphalt (5%)', calculatedValues.transitionExtraAsphalt, 'transition'),
                renderDisplayRow('Total Asphalt Tons', calculatedValues.transitionTotalTons, 'transition'),
                renderDisplayRow('Price Per Ton', calculatedValues.pricePerTon, 'transition'),
                renderDisplayRow('Asphalt Cost', calculatedValues.transitionAsphaltCost, 'transition'),
                renderDisplayRow('Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'transition'),
                renderDisplayRow('Trucking In Cost', calculatedValues.transitionTruckingInCost, 'transition'),
                renderDisplayRow('Labor Cost per Ton', calculatedValues.transitionLaborCostPerTon, 'transition'),
                renderDisplayRow('Installation Labor Cost', calculatedValues.transitionLaborCost, 'transition'),
                renderDisplayRow('Trucking Out Cost per Ton', calculatedValues.truckingOutCostPerTon, 'transition'),
                renderDisplayRow('Trucking Out Cost', calculatedValues.transitionTruckingOutCost, 'transition'),
                renderDisplayRow('Removal Labor Cost per Ton', calculatedValues.removalLaborCostPerTon, 'transition'),
                renderDisplayRow('Removal Labor Cost', calculatedValues.transitionRemovalLaborCost, 'transition'),
                renderDisplayRow('Flat Rate Mobilization Fee', calculatedValues.transitionFlatRateMobilizationFee, 'transition'),
                renderDisplayRow('Distance', transitionDistance, 'transition', setTransitionDistance),
                renderDisplayRow('Removal Mileage Cost', calculatedValues.transitionRemovalMileageCost, 'transition'),
                renderDisplayRow('Total Cost', calculatedValues.transitionTotalCost, 'transition')
              ].map((row) => (
                shouldShowRow(row.props.label, 'transition') ? row : null
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
                renderDisplayRow('Base Price per Ton', calculatedValues.drivewayBasePricePerTon, 'driveway'),
                renderDisplayRow('Base Cost', calculatedValues.drivewayBaseCost, 'driveway'),
                renderDisplayRow('Base Trucking In Cost per Ton', calculatedValues.truckingInCostPerTon, 'driveway'),
                renderDisplayRow('Base Trucking In Cost', calculatedValues.drivewayBaseTruckingInCost, 'driveway'),
                renderDisplayRow('Base Labor Cost per Ton', calculatedValues.drivewayBaseLaborCostPerTon, 'driveway'),
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
                      parseFloat(calculatedValues.overlayTotalCost.replace(/,/g, '')) +
                      parseFloat(calculatedValues.additionalInchTotalCost.replace(/,/g, '')) +
                      parseFloat(calculatedValues.transitionTotalCost.replace(/,/g, '')) +
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
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Tack Coat Fee ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.tackCoatFee}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, tackCoatFee: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Preparation Fee ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.preparationFee}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, preparationFee: text }))}
                  keyboardType="numeric"
                />
              </View>

              {/* Base Settings */}
              <ThemedText style={styles.modalSectionTitle}>Base Settings</ThemedText>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Base Price Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.drivewayBasePricePerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, drivewayBasePricePerTon: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalInputContainer}>
                <ThemedText style={styles.modalInputLabel}>Base Labor Cost Per Ton ($)</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={tempDefaultValues.drivewayBaseLaborCostPerTon}
                  onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, drivewayBaseLaborCostPerTon: text }))}
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
}); 