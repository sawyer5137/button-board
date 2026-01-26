import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const buttonSize = width * 0.15;
const IP = "http://192.168.1.50:1234";

export default function App() {
  const [buttonArr, setButtonArr] = useState([]);
  const [stack, setStack] = useState([]);

  console.log(`Using IP: ${IP}`);

  const fetchButtons = () => {
    fetch(IP + "/buttonConfig")
      .then((resp) => {
        console.log("button config called");
        return resp.json();
      })
      .then((data) => setButtonArr(data))
      .catch((err) => console.log(err));
  };

  // sends request to server with button number
  const accessRoute = async (id) => {
    fetch(IP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ buttonId: id }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error retrieving buttons");
        }
        return response.json();
      })
      .then(() => {
        console.log(`Button ${id} pressed`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handlePress = (button, index) => {
    if (!button.action) {
      setStack((s) => [...s, buttonArr]);
      setButtonArr(button.buttons || []);
    } else {
      accessRoute(index);
    }
  };

  const goBack = () => {
    setStack((s) => {
      if (s.length === 0) return s;
      const prev = s[s.length - 1];
      setButtonArr(prev);
      return s.slice(0, -1);
    });
  };

  //fetches buttonConfig json file on app load
  useEffect(() => {
    fetchButtons();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* Button array */}
        {buttonArr.map((button, index) => (
          <Pressable
            key={index}
            onPress={() => handlePress(button, index)}
            style={({ pressed }) => [
              styles.buttonBase,
              pressed && styles.buttonBasePressed,
            ]}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.buttonFace,
                  pressed && styles.buttonFacePressed,
                  { backgroundColor: button.color },
                ]}
              >
                {/* Face  highlight*/}
                {!pressed && (
                  <LinearGradient
                    colors={[
                      "rgba(255,255,255,0.45)",
                      "rgba(255,255,255,0.15)",
                      "rgba(255,255,255,0)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.highlight}
                  />
                )}

                {/* Face shadow */}
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.15)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.shadowFade}
                />

                {/* Content */}
                {button.image ? (
                  <Image
                    source={{ uri: `${IP}/images/${button.image}` }}
                    style={styles.buttonImage}
                  />
                ) : (
                  <Text style={styles.buttonText}>{button.text}</Text>
                )}
              </View>
            )}
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.refreshButton} onPress={fetchButtons}>
        <Text style={styles.refreshText}>Refresh</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },

  buttonBase: {
    width: buttonSize,
    height: buttonSize,
    margin: 10,
    borderRadius: 14,
    backgroundColor: "#666", // darker base = shadow body
  },

  buttonFace: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    backgroundImage: "linear-gradient(to bottom, #000, #888)",

    // lift the face up
    transform: [{ translateY: -6 }],
  },

  buttonFacePressed: {
    // sink the button
    transform: [{ translateY: 0 }],
    elevation: 1,
    shadowOpacity: 0.15,
  },

  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  buttonImage: {
    position: "absolute",
    borderRadius: 10,
    width: buttonSize,
    height: buttonSize,
  },

  // button highlight
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  shadowFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
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
