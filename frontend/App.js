import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
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
          <TouchableOpacity
            key={index}
            style={[styles.button, { backgroundColor: item.color }]}
            onPress={() => accessRoute(index)}
          >
            <>
              <Text style={styles.buttonText}>{item.text}</Text>
              {item.image && (
                <Image
                  source={{ uri: `${IP}/images/${item.image}` }}
                  style={styles.buttonImage}
                ></Image>
              )}
            </>
          </TouchableOpacity>
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
    backgroundColor: "lightgray",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  button: {
    width: buttonSize,
    height: buttonSize,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    padding: 3,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: "white",
    elevation: 10,
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
