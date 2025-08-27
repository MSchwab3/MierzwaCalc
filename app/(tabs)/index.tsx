import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/Paving_logo.png')} 
          style={styles.logo}
          contentFit="contain"
        />
      </ThemedView>
      
      <ThemedView style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => router.push('/remove-replace')}>
          <ThemedText style={styles.buttonText}>Remove & Replace</ThemedText>
        </Pressable>
        
        <Pressable style={styles.button} onPress={() => router.push('/overlay-transitions')}>
          <ThemedText style={styles.buttonText}>Overlay & Transitions</ThemedText>
        </Pressable>
        
        <Pressable style={styles.button} onPress={() => router.push('/concrete-asphalt')}>
          <ThemedText style={styles.buttonText}>Concrete Out & Asphalt In</ThemedText>
        </Pressable>
        
        <Pressable style={styles.button} onPress={() => router.push('/grade-pave-base')}>
          <ThemedText style={styles.buttonText}>Grade Pave Base Replacement</ThemedText>
        </Pressable>
        
        <Pressable style={styles.button} onPress={() => router.push('/extras')}>
          <ThemedText style={styles.buttonText}>Extras</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 40,
    lineHeight: 40,
  },
  buttonContainer: {
    gap: 18,
  },
  button: {
    backgroundColor: '#FF4040',
    borderWidth: 2,
    borderColor: '#000000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20,
  },
  logo: {
    width: 400,
    height: 200,
  },
});
