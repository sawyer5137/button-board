import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import { useState, useEffect } from "react";

const { width, height } = Dimensions.get("window");
const buttonSize = width * 0.15;
const IP = "http://192.168.1.50:1234";

export default function App() {
  const [buttonArr, setButtonArr] = useState([]);

  console.log(`Using IP: ${IP}`);

  // request button config to set up buttons
  useEffect(() => {
    fetch(IP + "/buttonConfig")
      .then((resp) => {
        console.log("button config called");
        return resp.json();
      })
      .then((data) => setButtonArr(data))
      .catch((err) => console.log(err));
  }, []);

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

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {buttonArr.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => accessRoute(index)}
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
                  { backgroundColor: item.color },
                ]}
              >
                {/* Renders image if present otherwise renders just text */}
                {item.image ? (
                  <Image
                    source={{ uri: `${IP}/images/${item.image}` }}
                    style={styles.buttonImage}
                  />
                ) : (
                  <Text style={styles.buttonText}>{item.text}</Text>
                )}
              </View>
            )}
          </Pressable>
        ))}
      </View>
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
    backgroundColor: "#222", // darker base = shadow body
  },

  buttonFace: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,

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
});
