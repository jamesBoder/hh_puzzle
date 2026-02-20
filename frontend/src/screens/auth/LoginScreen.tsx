import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    const success = await login({ email, password });
    if (success) {
      // Navigate back to Profile screen which will now show the full profile
      navigation.navigate('ProfileMain');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>HH Puzzle</Text>
        <Text style={styles.subtitle}>Hip-Hop Crossword Game</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Don't have an account? Register
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  title: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  subtitle: {
    fontSize: typography.sizes.xxxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.hero,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.textPrimary,
    padding: spacing.xxl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
    fontSize: typography.sizes.xxl,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.xxl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.base,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  linkButton: {
    marginTop: spacing.xxxl,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: typography.sizes.xxl,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  backText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xl,
  },
});
