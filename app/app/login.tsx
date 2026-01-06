import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/AuthStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { login, isLoading, error, user, hydrateAuth } = useAuthStore();

  useEffect(() => {
    hydrateAuth();
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    const result = await login({ email, password });

    if (result.success) {
      router.replace("/dashboard");
    } else {
      Alert.alert("Login Failed", result.message || "Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Graphics */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Login Card */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={32} color="#4F8CFF" />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Log in to access your dashboard
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#9AA4B2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9AA4B2"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9AA4B2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter your password"
                    placeholderTextColor="#9AA4B2"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9AA4B2"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </TouchableOpacity>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#4F8CFF" />
            <Text style={styles.securityText}>
              Secured with end-to-end encryption
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },
  orb1: {
    top: 0,
    right: 0,
    width: 400,
    height: 400,
    backgroundColor: "rgba(79, 140, 255, 0.2)",
  },
  orb2: {
    bottom: 0,
    left: 0,
    width: 450,
    height: 450,
    backgroundColor: "rgba(154, 164, 178, 0.2)",
  },
  orb3: {
    top: "50%",
    right: "25%",
    width: 325,
    height: 325,
    backgroundColor: "rgba(79, 140, 255, 0.15)",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "rgba(16, 21, 30, 0.8)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1F2937",
    padding: 24,
    shadowColor: "#4F8CFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(79, 140, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(79, 140, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E8ECF1",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#9AA4B2",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E8ECF1",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 21, 30, 0.5)",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#E8ECF1",
    fontSize: 14,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
  },
  forgotText: {
    fontSize: 14,
    color: "#4F8CFF",
  },
  loginButton: {
    backgroundColor: "#4F8CFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#4F8CFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: "#4F8CFF80",
  },
  loginButtonText: {
    color: "#080B10",
    fontSize: 14,
    fontWeight: "bold",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    padding: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 6,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#ef4444",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#9AA4B2",
  },
  signupLink: {
    fontSize: 14,
    color: "#4F8CFF",
    fontWeight: "600",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(16, 21, 30, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 999,
    alignSelf: "center",
  },
  securityText: {
    fontSize: 12,
    color: "#9AA4B2",
  },
});
