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
  section?: 'pvc' | 'culvert' | 'erosion' | 'additional' | 'total';
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
                            label.toLowerCase().includes('rate') ||
                            label === 'Commission Amount';

  const getUnit = (label: string) => {
    if (label === 'PVC Pipe Thickness') return ' inches';
    if (label === 'Amount of PVC Pipe Needed' || label.includes('Length') || label.includes('Width') || label.includes('Diameter') || label === 'Perimeter Measurement') return ' feet';
    if (label.includes('Area')) return ' square feet';
    if (label === 'Rental Period') return ' days';
    if (label === 'Equipment Rental Cost') return ' per day';
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
          <ThemedText style={styles.subtitle}>{label}:</ThemedText>
          <View style={styles.selectionContainer}>
            {label === 'Job Type' ? (
              <>
                <Pressable
                  style={[
                    styles.selectionButton,
                    value === 'Erosion' && styles.selectionButtonSelected
                  ]}
                  onPress={() => setOnlyAsphaltAdded?.('Erosion')}
                >
                  <ThemedText style={[
                    styles.selectionText,
                    value === 'Erosion' && styles.selectionTextSelected
                  ]}>Erosion</ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.selectionButton,
                    value === 'Restoration' && styles.selectionButtonSelected
                  ]}
                  onPress={() => setOnlyAsphaltAdded?.('Restoration')}
                >
                  <ThemedText style={[
                    styles.selectionText,
                    value === 'Restoration' && styles.selectionTextSelected
                  ]}>Restoration</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
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
              </>
            )}
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
                {label === 'PVC Pipe Thickness' && <ThemedText style={styles.unitLabel}>inches</ThemedText>}
                {(label === 'Amount of PVC Pipe Needed' || label === 'Length' || label === 'Width' || label === 'Diameter' || label === 'Perimeter Measurement') && <ThemedText style={styles.unitLabel}>feet</ThemedText>}
                {label === 'Area' && <ThemedText style={styles.unitLabel}>square feet</ThemedText>}
                {label === 'Rental Period' && <ThemedText style={styles.unitLabel}>days</ThemedText>}
                {label === 'Equipment Rental Cost' && <ThemedText style={styles.unitLabel}>per day</ThemedText>}
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

export default function ExtrasScreen() {
  // Add ScrollView reference
  const scrollViewRef = useRef<ScrollView>(null);

  // State for user input fields
  // PVC section inputs
  const [pvcThickness, setPvcThickness] = useState('');
  const [pvcAmount, setPvcAmount] = useState('');

  // Commission amount
  const [commissionAmount, setCommissionAmount] = useState('');

  // Culvert section
  const [culvertNeeded, setCulvertNeeded] = useState('No');
  const [endSectionsNeeded, setEndSectionsNeeded] = useState('No');
  const [additionalFeet, setAdditionalFeet] = useState('');

  // Soil Erosion section
  const [erosionType, setErosionType] = useState('Erosion');
  const [perimeterMeasurement, setPerimeterMeasurement] = useState('');

  // Additional Extras section
  const [equipmentRentalCost, setEquipmentRentalCost] = useState('');
  const [rentalPeriod, setRentalPeriod] = useState('');
  const [catchBasinCost, setCatchBasinCost] = useState('');
  const [asphaltBermCost, setAsphaltBermCost] = useState('');
  const [trafficCost, setTrafficCost] = useState('');
  const [permitCost, setPermitCost] = useState('');
  const [logisticsCost, setLogisticsCost] = useState('');
  const [extraCost, setExtraCost] = useState('');

  // Modal state
  const [isDefaultValuesModalVisible, setIsDefaultValuesModalVisible] = useState(false);
  const [tempDefaultValues, setTempDefaultValues] = useState({
    pvcCostPerFoot: '',
    pvcLaborCostPerFoot: '',
    downspoutSetupCost: '',
    materialDeliveryCost: '',
    downspoutLaborCost: '',
    culvertCost: '',
    additionalCostPerFoot: '',
    culvertLaborCost: '',
    culvertDeliveryCost: '',
    soilErosionRate: '',
    soilRestorationRate: '',
  });

  // Load default values from AsyncStorage on component mount
  useEffect(() => {
    loadDefaultValues();
  }, []);

  const loadDefaultValues = async () => {
    try {
      const savedValues = await AsyncStorage.getItem('extrasDefaultValues');
      if (savedValues) {
        const parsedValues = JSON.parse(savedValues);
        setCalculatedValues(prev => ({
          ...prev,
          ...parsedValues,
        }));
      }
    } catch (error) {
      console.error('Error loading default values:', error);
    }
  };

  // Calculated values state
  const [calculatedValues, setCalculatedValues] = useState({
    // PVC section values
    pvcCostPerFoot: '10',           // Fixed cost per foot
    pvcLaborCostPerFoot: '15',      // Fixed labor cost per foot
    pvcPipingCost: '0',             // Total piping cost
    pvcLaborCost: '0',              // Total labor cost
    downSpoutSetupCost: '100',      // Fixed down spout setup cost
    materialDeliveryCost: '100',    // Fixed material delivery cost
    downSpoutLaborCost: '75',       // Fixed down spout labor cost
    pvcTotalCost: '0',              // Total cost for PVC section
    
    // Culvert section values
    culvertCost: '500',             // Fixed culvert cost
    endSectionsCost: '0',           // Dynamic end sections cost (310 if Yes, 0 if No)
    additionalCostPerFoot: '35',    // Fixed additional cost per foot
    additionalFeetCost: '0',        // Calculated additional feet cost
    culvertLaborCost: '1000',       // Fixed culvert labor cost
    culvertDeliveryCost: '100',     // Fixed culvert delivery cost
    culvertTotalCost: '0',          // Total cost for culvert section
    
    // Soil Erosion section values
    soilErosionRate: '3',           // Fixed soil erosion rate
    soilRestorationRate: '5',       // Fixed soil restoration rate
    soilErosionTotalCost: '0',      // Total cost for soil erosion section
    
    // Additional Extras section values
    rentalCost: '0',                // Calculated rental cost
    additionalExtrasTotalCost: '0', // Total cost for additional extras section
  });

  // Add state for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    pvc: false,
    culvert: false,
    erosion: false,
    additional: false
  });

  // Function to reset all inputs
  const handleNewQuote = () => {
    // Reset all input states
    setPvcThickness('');
    setPvcAmount('');
    setCommissionAmount('');
    setCulvertNeeded('No');
    setEndSectionsNeeded('No');
    setAdditionalFeet('');
    setPerimeterMeasurement('');
    setErosionType('Erosion');
    setEquipmentRentalCost('');
    setRentalPeriod('');
    setCatchBasinCost('');
    setAsphaltBermCost('');
    setTrafficCost('');
    setPermitCost('');
    setLogisticsCost('');
    setExtraCost('');
    
    // Scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Function to toggle section expansion
  const toggleSection = (section: 'pvc' | 'culvert' | 'erosion' | 'additional') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Section Title component with toggle button
  const SectionTitle = ({ title, section }: { title: string, section: 'pvc' | 'culvert' | 'erosion' | 'additional' }) => (
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

  // Helper function to determine if a row should be shown
  const shouldShowRow = (label: string, section: 'pvc' | 'culvert' | 'erosion' | 'additional' | 'total') => {
    if (section === 'total') return true;  // Always show total section rows
    const isExpanded = expandedSections[section];
    const isCostRow = [
      'Total Cost',
      'PVC Piping Cost',
      'PVC Labor Cost',
      'Down Spout Setup Cost',
      'Material Delivery Cost',
      'Down Spout Labor Cost',
      'Culvert Cost',
      'End Sections Cost',
      'Additional Feet Cost',
      'Culvert Labor Cost',
      'Culvert Delivery Cost'
    ].includes(label);
    
    const isInputRow = label === 'Length' || 
                      label === 'Width' || 
                      label === 'Diameter' || 
                      label === 'Area' ||
                      label === 'Commission Amount' ||
                      label === 'PVC Pipe Thickness' ||
                      label === 'Amount of PVC Pipe Needed' ||
                      label === 'Additional Feet' ||
                      label === 'Perimeter Measurement' ||
                      label === 'Equipment Rental Cost' ||
                      label === 'Rental Period' ||
                      label === 'Catch Basin Cost' ||
                      label === 'Asphalt Berm Cost' ||
                      label === 'Traffic Cost' ||
                      label === 'Permit Cost' ||
                      label === 'Logistics Cost' ||
                      label === 'Extra Cost';
    
    const isSelectionRow = label === 'Culvert Needed' || label === 'End Sections Needed' || label === 'Job Type';
    
    // Always show cost rows, input rows, selection rows, and total cost, hide others when collapsed
    return isExpanded || isCostRow || isInputRow || isSelectionRow || label === 'Total Cost';
  };

  // Effect hook to recalculate values when inputs change
  React.useEffect(() => {
    const calculateValues = () => {
      // Parse input values with fallback to 0
      const amount = parseFloat(pvcAmount) || 0;

      // Calculate PVC costs
      const pipingCost = amount * parseFloat(calculatedValues.pvcCostPerFoot);
      const laborCost = amount * parseFloat(calculatedValues.pvcLaborCostPerFoot);
      const totalCost = (parseFloat(pvcThickness) || 0) === 0 ? 0 : pipingCost + laborCost + 
                       parseFloat(calculatedValues.downSpoutSetupCost) +
                       parseFloat(calculatedValues.materialDeliveryCost) +
                       parseFloat(calculatedValues.downSpoutLaborCost);

      // Calculate end sections cost based on selection
      const endSectionsCostValue = endSectionsNeeded === 'Yes' ? 310 : 0;

      // Calculate additional feet cost
      const additionalFeetValue = parseFloat(additionalFeet) || 0;
      const additionalFeetCostValue = additionalFeetValue * parseFloat(calculatedValues.additionalCostPerFoot);

      // Calculate culvert total cost
      const culvertTotalCostValue = culvertNeeded === 'Yes' ? 
        parseFloat(calculatedValues.culvertCost) +
        endSectionsCostValue +
        additionalFeetCostValue +
        parseFloat(calculatedValues.culvertLaborCost) +
        parseFloat(calculatedValues.culvertDeliveryCost) : 0;

      // Calculate soil erosion total cost
      const perimeterValue = parseFloat(perimeterMeasurement) || 0;
      let soilErosionTotalCostValue = 0;
      
      if (perimeterValue > 0) {
        if (perimeterValue <= 125) {
          soilErosionTotalCostValue = 400;
        } else {
          const extraFeet = perimeterValue - 125;
          const baseCost = 400;
          let rateValue = 0;
          
          if (erosionType === 'Erosion') {
            rateValue = parseFloat(calculatedValues.soilErosionRate);
          } else if (erosionType === 'Restoration') {
            rateValue = parseFloat(calculatedValues.soilRestorationRate);
          }
          
          const extraCost = extraFeet * rateValue;
          soilErosionTotalCostValue = baseCost + extraCost;
        }
      }

      // Calculate rental cost
      const equipmentRentalCostValue = parseFloat(equipmentRentalCost) || 0;
      const rentalPeriodValue = parseFloat(rentalPeriod) || 0;

      setCalculatedValues(prev => ({
        ...prev,
        pvcPipingCost: pipingCost.toFixed(2),
        pvcLaborCost: laborCost.toFixed(2),
        pvcTotalCost: totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        endSectionsCost: endSectionsCostValue.toString(),
        additionalFeetCost: additionalFeetCostValue.toFixed(2),
        culvertTotalCost: culvertTotalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        soilErosionTotalCost: soilErosionTotalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        
        // Calculate rental cost
        rentalCost: (equipmentRentalCostValue * rentalPeriodValue).toFixed(2),
        
        // Calculate additional extras total cost
        additionalExtrasTotalCost: (
          (equipmentRentalCostValue * rentalPeriodValue) +
          (parseFloat(catchBasinCost) || 0) +
          (parseFloat(asphaltBermCost) || 0) +
          (parseFloat(trafficCost) || 0) +
          (parseFloat(permitCost) || 0) +
          (parseFloat(logisticsCost) || 0) +
          (parseFloat(extraCost) || 0)
        ).toFixed(2),
      }));
    };

    calculateValues();
  }, [pvcAmount, calculatedValues.pvcCostPerFoot, calculatedValues.pvcLaborCostPerFoot, endSectionsNeeded, additionalFeet, calculatedValues.additionalCostPerFoot, culvertNeeded, perimeterMeasurement, erosionType, calculatedValues.soilErosionRate, calculatedValues.soilRestorationRate, equipmentRentalCost, rentalPeriod, catchBasinCost, asphaltBermCost, trafficCost, permitCost, logisticsCost, extraCost]);

  // Function to render display rows
  const renderDisplayRow = React.useCallback((label: string, value: string, section: DisplayRowProps['section'], handler?: (text: string) => void) => {
    const isInputRow = label === 'Length' || 
                      label === 'Width' || 
                      label === 'Diameter' || 
                      label === 'Area' ||
                      label === 'Commission Amount' ||
                      label === 'PVC Pipe Thickness' ||
                      label === 'Amount of PVC Pipe Needed' ||
                      label === 'Additional Feet' ||
                      label === 'Perimeter Measurement' ||
                      label === 'Equipment Rental Cost' ||
                      label === 'Rental Period' ||
                      label === 'Catch Basin Cost' ||
                      label === 'Asphalt Berm Cost' ||
                      label === 'Traffic Cost' ||
                      label === 'Permit Cost' ||
                      label === 'Logistics Cost' ||
                      label === 'Extra Cost';

    const isCostRow = [
      'Total Cost',
      'PVC Piping Cost',
      'PVC Labor Cost',
      'Down Spout Setup Cost',
      'Material Delivery Cost',
      'Down Spout Labor Cost',
      'Culvert Cost',
      'End Sections Cost',
      'Additional Feet Cost',
      'Culvert Labor Cost',
      'Culvert Delivery Cost'
    ].includes(label);

    const isSelectionRow = label === 'Culvert Needed' || label === 'End Sections Needed' || label === 'Job Type';

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
        onlyAsphaltAdded={label === 'Culvert Needed' ? culvertNeeded : label === 'End Sections Needed' ? endSectionsNeeded : label === 'Job Type' ? erosionType : culvertNeeded}
        setOnlyAsphaltAdded={label === 'Culvert Needed' ? setCulvertNeeded : label === 'End Sections Needed' ? setEndSectionsNeeded : label === 'Job Type' ? setErosionType : setCulvertNeeded}
      />
    );
  }, [culvertNeeded, endSectionsNeeded]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Extras' }} />
      
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
                  pvcCostPerFoot: calculatedValues.pvcCostPerFoot,
                  pvcLaborCostPerFoot: calculatedValues.pvcLaborCostPerFoot,
                  downspoutSetupCost: calculatedValues.downSpoutSetupCost,
                  materialDeliveryCost: calculatedValues.materialDeliveryCost,
                  downspoutLaborCost: calculatedValues.downSpoutLaborCost,
                  culvertCost: calculatedValues.culvertCost,
                  additionalCostPerFoot: calculatedValues.additionalCostPerFoot,
                  culvertLaborCost: calculatedValues.culvertLaborCost,
                  culvertDeliveryCost: calculatedValues.culvertDeliveryCost,
                  soilErosionRate: calculatedValues.soilErosionRate,
                  soilRestorationRate: calculatedValues.soilRestorationRate,
                });
                setIsDefaultValuesModalVisible(true);
              }}
            >
              <ThemedText style={styles.defaultValuesButtonText}>Change Default Values</ThemedText>
            </Pressable>
          </View>

          {/* PVC | Sleeving | Downspout Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="PVC | Sleeving | Downspout" section="pvc" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('PVC Pipe Thickness', pvcThickness, 'pvc', setPvcThickness),
                renderDisplayRow('PVC Piping Cost per Foot', calculatedValues.pvcCostPerFoot, 'pvc'),
                renderDisplayRow('Amount of PVC Pipe Needed', pvcAmount, 'pvc', setPvcAmount),
                renderDisplayRow('PVC Piping Cost', calculatedValues.pvcPipingCost, 'pvc'),
                renderDisplayRow('PVC Labor Cost per Foot', calculatedValues.pvcLaborCostPerFoot, 'pvc'),
                renderDisplayRow('PVC Labor Cost', calculatedValues.pvcLaborCost, 'pvc'),
                renderDisplayRow('Down Spout Setup Cost', calculatedValues.downSpoutSetupCost, 'pvc'),
                renderDisplayRow('Material Delivery Cost', calculatedValues.materialDeliveryCost, 'pvc'),
                renderDisplayRow('Down Spout Labor Cost', calculatedValues.downSpoutLaborCost, 'pvc'),
                renderDisplayRow('Total Cost', calculatedValues.pvcTotalCost, 'pvc')
              ].map((row) => (
                shouldShowRow(row.props.label, 'pvc') ? row : null
              ))}
            </View>
          </View>

          {/* Culvert Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Culvert" section="culvert" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Culvert Needed', culvertNeeded, 'culvert'),
                renderDisplayRow('Culvert Cost', calculatedValues.culvertCost, 'culvert'),
                renderDisplayRow('End Sections Needed', endSectionsNeeded, 'culvert'),
                renderDisplayRow('End Sections Cost', calculatedValues.endSectionsCost, 'culvert'),
                renderDisplayRow('Additional Feet', additionalFeet, 'culvert', setAdditionalFeet),
                renderDisplayRow('Additional Cost per Foot', calculatedValues.additionalCostPerFoot, 'culvert'),
                renderDisplayRow('Additional Feet Cost', calculatedValues.additionalFeetCost, 'culvert'),
                renderDisplayRow('Culvert Labor Cost', calculatedValues.culvertLaborCost, 'culvert'),
                renderDisplayRow('Culvert Delivery Cost', calculatedValues.culvertDeliveryCost, 'culvert'),
                renderDisplayRow('Total Cost', calculatedValues.culvertTotalCost, 'culvert')
              ].map((row) => (
                shouldShowRow(row.props.label, 'culvert') ? row : null
              ))}
            </View>
          </View>

          {/* Soil Erosion | Restoration Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Soil Erosion | Restoration" section="erosion" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Job Type', erosionType, 'erosion'),
                renderDisplayRow('Perimeter Measurement', perimeterMeasurement, 'erosion', setPerimeterMeasurement),
                renderDisplayRow('Soil Erosion Rate', calculatedValues.soilErosionRate, 'erosion'),
                renderDisplayRow('Soil Restoration Rate', calculatedValues.soilRestorationRate, 'erosion'),
                renderDisplayRow('Total Cost', calculatedValues.soilErosionTotalCost, 'erosion')
              ].map((row) => (
                shouldShowRow(row.props.label, 'erosion') ? row : null
              ))}
            </View>
          </View>

          {/* Additional Extras Section */}
          <View style={styles.sectionContainer}>
            <SectionTitle title="Additional Extras" section="additional" />
            <View style={styles.sectionContent}>
              {[
                renderDisplayRow('Equipment Rental Cost', equipmentRentalCost, 'additional', setEquipmentRentalCost),
                renderDisplayRow('Rental Period', rentalPeriod, 'additional', setRentalPeriod),
                renderDisplayRow('Rental Cost', calculatedValues.rentalCost, 'additional'),
                renderDisplayRow('Catch Basin Cost', catchBasinCost, 'additional', setCatchBasinCost),
                renderDisplayRow('Asphalt Berm Cost', asphaltBermCost, 'additional', setAsphaltBermCost),
                renderDisplayRow('Traffic Cost', trafficCost, 'additional', setTrafficCost),
                renderDisplayRow('Permit Cost', permitCost, 'additional', setPermitCost),
                renderDisplayRow('Logistics Cost', logisticsCost, 'additional', setLogisticsCost),
                renderDisplayRow('Extra Cost', extraCost, 'additional', setExtraCost),
                renderDisplayRow('Total Cost', calculatedValues.additionalExtrasTotalCost, 'additional')
              ].map((row) => (
                shouldShowRow(row.props.label, 'additional') ? row : null
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
                      parseFloat(calculatedValues.pvcTotalCost.replace(/,/g, '')) +
                      parseFloat(calculatedValues.culvertTotalCost.replace(/,/g, '')) +
                      parseFloat(calculatedValues.soilErosionTotalCost.replace(/,/g, '')) +
                      parseFloat(calculatedValues.additionalExtrasTotalCost.replace(/,/g, '')) +
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
              
              {/* PVC Section */}
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalSectionTitle}>PVC</ThemedText>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>PVC Cost per Foot</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.pvcCostPerFoot}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, pvcCostPerFoot: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>PVC Labor Cost per Foot</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.pvcLaborCostPerFoot}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, pvcLaborCostPerFoot: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
              </View>

              {/* Downspout Section */}
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalSectionTitle}>Downspout</ThemedText>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>Downspout Setup Cost</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.downspoutSetupCost}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, downspoutSetupCost: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>Downspout Labor Cost</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.downspoutLaborCost}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, downspoutLaborCost: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
              </View>

              {/* Material Delivery Section */}
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalSectionTitle}>Material Delivery</ThemedText>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>Material Delivery Cost</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.materialDeliveryCost}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, materialDeliveryCost: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
              </View>

              {/* Culvert Section */}
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalSectionTitle}>Culvert</ThemedText>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>Culvert Cost</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.culvertCost}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, culvertCost: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>Additional Cost per Foot</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.additionalCostPerFoot}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, additionalCostPerFoot: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>Culvert Labor Cost</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.culvertLaborCost}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, culvertLaborCost: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>Culvert Delivery Cost</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.culvertDeliveryCost}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, culvertDeliveryCost: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
              </View>

              {/* Soil Erosion Section */}
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalSectionTitle}>Soil Erosion | Restoration</ThemedText>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>Soil Erosion Rate</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.soilErosionRate}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, soilErosionRate: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.modalInputContainer}>
                  <ThemedText style={styles.modalLabel}>Soil Restoration Rate</ThemedText>
                  <TextInput
                    style={styles.modalTextInput}
                    value={tempDefaultValues.soilRestorationRate}
                    onChangeText={(text) => setTempDefaultValues(prev => ({ ...prev, soilRestorationRate: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
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
                onPress={async () => {
                  try {
                    // Create object with the default values to save
                    const defaultValuesToSave = {
                      pvcCostPerFoot: tempDefaultValues.pvcCostPerFoot,
                      pvcLaborCostPerFoot: tempDefaultValues.pvcLaborCostPerFoot,
                      downSpoutSetupCost: tempDefaultValues.downspoutSetupCost,
                      materialDeliveryCost: tempDefaultValues.materialDeliveryCost,
                      downSpoutLaborCost: tempDefaultValues.downspoutLaborCost,
                      culvertCost: tempDefaultValues.culvertCost,
                      additionalCostPerFoot: tempDefaultValues.additionalCostPerFoot,
                      culvertLaborCost: tempDefaultValues.culvertLaborCost,
                      culvertDeliveryCost: tempDefaultValues.culvertDeliveryCost,
                      soilErosionRate: tempDefaultValues.soilErosionRate,
                      soilRestorationRate: tempDefaultValues.soilRestorationRate,
                    };

                    // Save to AsyncStorage
                    await AsyncStorage.setItem('extrasDefaultValues', JSON.stringify(defaultValuesToSave));

                    // Update the calculated values with the temp values
                    setCalculatedValues(prev => ({
                      ...prev,
                      ...defaultValuesToSave,
                    }));

                    setIsDefaultValuesModalVisible(false);
                  } catch (error) {
                    console.error('Error saving default values:', error);
                  }
                }}
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

  // Selection button styling
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

  // Modal form styling
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000000',
  },
  modalInputContainer: {
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#000000',
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
});