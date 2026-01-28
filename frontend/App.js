import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import ButtonTile from "./components/ButtonTile";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const buttonSize = width * 0.15;
const IP = "http://10.0.0.26:1234";
console.log(`Using IP: ${IP}`);

export default function App() {
  const [buttonArr, setButtonArr] = useState([]);
  const [stack, setStack] = useState([]);
  const [navStack, setNavStack] = useState([]);
  const [configVersion, setConfigVersion] = useState(null);

  const fetchButtons = () => {
    fetch(IP + "/buttonConfig")
      .then((resp) => {
        console.log("button config called");
        return resp.json();
      })
      .then((data) => {
        setButtonArr(data.buttons);
        setConfigVersion(data.version);
        setStack([]);
      })
      .catch((err) => console.log(err));
  };

  // sends request to server with button number
  const accessRoute = (buttonId) => {
    fetch(IP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buttonId, version: configVersion }),
    })
      .then(async (response) => {
        if (response.status === 409) {
          // stale config - refresh immediately so UI + server mapping match again
          await fetchButtons();
          return;
        }
        if (!response.ok) throw new Error("Error running action");
        return response.json();
      })
      .catch((err) => console.log(err));
  };

  const handlePress = (button) => {
    if (!button.action) {
      setStack((s) => [...s, buttonArr]);
      setNavStack((s) => [...s, button.text]);
      setButtonArr(button.buttons || []);
    } else {
      accessRoute(button.id);
    }
  };

  const goBack = () => {
    setStack((s) => {
      if (s.length === 0) return s;
      const prev = s[s.length - 1];
      setButtonArr(prev);
      setNavStack((s) => s.slice(0, -1));
      return s.slice(0, -1);
    });
  };

  //fetches buttonConfig json file on app load
  useEffect(() => {
    fetchButtons();
  }, []);

  return (
    <LinearGradient colors={["#c7c5c5", "#929191"]} style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "center",
          marginTop: 50,
        }}
      >
        {navStack.length === 0 ? "Home" : "Home > " + navStack.join(" > ")}
      </Text>
      <View style={styles.container}>
        <View style={styles.grid}>
          {stack.length > 0 && (
            <ButtonTile
              onPress={goBack}
              size={buttonSize}
              button={{ color: "#888", text: "Back" }}
            >
              <Text style={styles.buttonText}>Back</Text>
            </ButtonTile>
          )}
          {/* Button array */}
          {buttonArr.map((button, index) => (
            <ButtonTile
              key={index}
              button={button}
              size={buttonSize}
              imageBaseUrl={IP + "/images"}
              onPress={() => handlePress(button, index)}
            />
          ))}
        </View>
        <Pressable style={styles.refreshButton} onPress={fetchButtons}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },

  buttonFacePressed: {
    // sink the button
    transform: [{ translateY: 0 }],
    elevation: 1,
    shadowOpacity: 0.15,
  },

  //Refresh button
  refreshButton: {
    position: "absolute",
    bottom: 25,
    right: 25,

    height: 44,
    paddingHorizontal: 16,

    borderRadius: 10,
    backgroundColor: "#eee",

    alignItems: "center",
    justifyContent: "center",

    elevation: 4,
  },

  refreshText: {
    fontSize: 16,
    fontWeight: "16",
    color: "#333",
  },
});
