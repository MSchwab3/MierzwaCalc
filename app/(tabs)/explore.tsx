import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function InfoScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.iconContainer}>
        <IconSymbol
          size={80}
          color="#dc2626"
          name="info.circle.fill"
          style={styles.icon}
        />
      </ThemedView>
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Information</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.contentContainer}>
        <ThemedText style={styles.description}>
          This is the information section of the MierzwaCalc app.
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Coming Soon
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    alignSelf: 'center',
  },
  titleContainer: {
    marginBottom: 30,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#dc2626',
  },
  placeholder: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
