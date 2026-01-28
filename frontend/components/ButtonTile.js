import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ButtonTile({ button, size, imageBaseUrl, onPress }) {
  const isFolder = !button.action;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        { width: size, height: size, borderRadius: 14, margin: 10 },
        pressed && styles.buttonBasePressed,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.buttonFace,
            { borderRadius: 14, backgroundColor: button.color },
            pressed && styles.buttonFacePressed,
          ]}
        >
          {/* Highlight overlay */}
          {!pressed && (
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.45)",
                "rgba(255,255,255,0.15)",
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[
                styles.highlight,
                { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
              ]}
              pointerEvents="none"
            />
          )}

          {/* Bottom shadow fade */}
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.shadowFade,
              { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
            ]}
            pointerEvents="none"
          />

          {/* Content */}
          {button.image ? (
            <Image
              source={{ uri: `${imageBaseUrl}/${button.image}` }}
              style={[
                styles.buttonImage,
                { width: size, height: size, borderRadius: 10 },
              ]}
            />
          ) : (
            <Text
              style={[styles.buttonText, { fontSize: 20 }]}
              numberOfLines={10}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.5}
            >
              {button.text}
            </Text>
          )}

          {isFolder && (
            <View style={{ position: "absolute", top: 10, left: 10 }}>
              <Text style={styles.buttonText}>📁</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    backgroundColor: "#666",
  },

  buttonFace: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    transform: [{ translateY: -6 }],
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#666",
  },

  buttonFacePressed: {
    transform: [{ translateY: 0 }],
    elevation: 1,
    shadowOpacity: 0.15,
  },

  buttonText: {
    color: "white",
    // fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  buttonImage: {
    position: "absolute",
  },

  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },

  shadowFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
});
