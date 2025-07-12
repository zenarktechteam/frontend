import RenderItem from "@/components/RenderItem";
import { SliderData } from "@/constants/SliderData";
import { Colors } from "@/Styles/GlobalColors";
import { useRouter } from "expo-router";
import { useState } from "react";
import AppIntroSlider from "react-native-app-intro-slider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const router = useRouter();

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user, logout, isAuthenticated } = useAuth();

  const handleSlideChange = (index: number) => {
    setCurrentIndex(index);
    if (index === SliderData.length - 1) {
      setTimeout(() => {
        router.push("/(auth)/Login");
      }, 500); 
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/Login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // If user is authenticated, show welcome screen
  if (isAuthenticated && user) {
    return (
      <ProtectedRoute>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome to Zenark</Text>
            <Text style={styles.userText}>
              Hello, {user.firstName} {user.lastName}!
            </Text>
            <Text style={styles.emailText}>{user.email}</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.contentTitle}>Your Mental Wellness Journey</Text>
            <Text style={styles.contentText}>
              Start your journey towards better mental health with our comprehensive tools and resources.
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ProtectedRoute>
    );
  }

  // Show intro slider for new users
  return (
    <AppIntroSlider
      data={SliderData}
      renderItem={RenderItem}
      onDone={() => router.push("/(auth)/Login")}
      onSlideChange={handleSlideChange}
      dotStyle={{
        backgroundColor: Colors.primaryDotColor,
        opacity: 0.6,
      }}
      activeDotStyle={{
        backgroundColor: Colors.primaryDotColor,
        opacity: 1,
      }}
      showNextButton={false}
      showDoneButton={false} // hide Done button as it's auto
      style={{ width: "100%", flex: 1, height: "100%" }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDotColor,
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.whiteColor,
    textAlign: 'center',
    marginBottom: 10,
  },
  userText: {
    fontSize: 20,
    color: Colors.whiteColor,
    textAlign: 'center',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: Colors.whiteColor,
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.whiteColor,
    textAlign: 'center',
    marginBottom: 15,
  },
  contentText: {
    fontSize: 16,
    color: Colors.whiteColor,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: Colors.whiteColor,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: Colors.primaryDotColor,
    fontSize: 18,
    fontWeight: '600',
  },
});
