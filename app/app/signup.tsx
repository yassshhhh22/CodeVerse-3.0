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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/AuthStore";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const { register, isLoading, error, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user]);

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(calculatePasswordStrength(text));
  };

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match!");
      return;
    }

    if (passwordStrength < 2) {
      Alert.alert("Weak Password", "Please create a stronger password");
      return;
    }

    const result = await register({ username, email, password });

    if (result.success) {
      router.replace("/dashboard");
    } else {
      Alert.alert(
        "Signup Failed",
        result.message || "Could not create account"
      );
    }
  };

  const strengthColors = ["#ef4444", "#f97316", "#9AA4B2", "#4F8CFF"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

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
          {/* Signup Card */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={32} color="#4F8CFF" />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Sign up to get started with CrowdCrawl
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9AA4B2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    placeholderTextColor="#9AA4B2"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

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
                    onChangeText={handlePasswordChange}
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

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBars}>
                      {[...Array(4)].map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                i < passwordStrength
                                  ? strengthColors[passwordStrength - 1]
                                  : "#1F2937",
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.strengthText}>
                      Password strength:{" "}
                      <Text style={styles.strengthLabel}>
                        {strengthLabels[passwordStrength - 1] || "Weak"}
                      </Text>
                    </Text>

                    {/* Password Requirements */}
                    <View style={styles.requirements}>
                      <Text
                        style={[
                          styles.requirementText,
                          password.length >= 8 && styles.requirementMet,
                        ]}
                      >
                        {password.length >= 8 ? "✓" : "•"} At least 8 characters
                      </Text>
                      <Text
                        style={[
                          styles.requirementText,
                          /[A-Z]/.test(password) && styles.requirementMet,
                        ]}
                      >
                        {/[A-Z]/.test(password) ? "✓" : "•"} One uppercase
                        letter
                      </Text>
                      <Text
                        style={[
                          styles.requirementText,
                          /[0-9]/.test(password) && styles.requirementMet,
                        ]}
                      >
                        {/[0-9]/.test(password) ? "✓" : "•"} One number
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9AA4B2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9AA4B2"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color="#9AA4B2"
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                  <View style={styles.matchContainer}>
                    <Ionicons
                      name={
                        password === confirmPassword
                          ? "checkmark-circle"
                          : "alert-circle"
                      }
                      size={14}
                      color={
                        password === confirmPassword ? "#4F8CFF" : "#ef4444"
                      }
                    />
                    <Text
                      style={[
                        styles.matchText,
                        password === confirmPassword
                          ? styles.matchSuccess
                          : styles.matchError,
                      ]}
                    >
                      {password === confirmPassword
                        ? "Passwords match"
                        : "Passwords don't match"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  isLoading && styles.signupButtonDisabled,
                ]}
                onPress={handleSignup}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Log In</Text>
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
    paddingTop: 60,
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
    textAlign: "center",
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
  strengthContainer: {
    marginTop: 8,
    gap: 6,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: "#9AA4B2",
  },
  strengthLabel: {
    fontWeight: "500",
    color: "#E8ECF1",
  },
  requirements: {
    gap: 4,
  },
  requirementText: {
    fontSize: 12,
    color: "#9AA4B2",
  },
  requirementMet: {
    color: "#4F8CFF",
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
  },
  matchSuccess: {
    color: "#4F8CFF",
  },
  matchError: {
    color: "#ef4444",
  },
  signupButton: {
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
  signupButtonDisabled: {
    backgroundColor: "#4F8CFF80",
  },
  signupButtonText: {
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
  loginLink: {
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
