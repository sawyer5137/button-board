import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

export default function AutoFitText({
  text,
  style,
  maxFontSize = 26,
  minFontSize = 14,
  maxLines = 2,
  paddingHorizontal = 8,
}) {
  const [containerWidth, setContainerWidth] = useState(null);
  const [fontSize, setFontSize] = useState(maxFontSize);
  const [measuredLines, setMeasuredLines] = useState(null);

  // reset when text changes
  useEffect(() => {
    setFontSize(maxFontSize);
    setMeasuredLines(null);
  }, [text, maxFontSize]);

  // If we measured and it's too many lines, shrink font (down to min)
  useEffect(() => {
    if (measuredLines == null) return;

    if (measuredLines > maxLines && fontSize > minFontSize) {
      setFontSize((s) => Math.max(minFontSize, s - 1));
      setMeasuredLines(null); // trigger re-measure at new size
    }
  }, [measuredLines, fontSize, maxLines, minFontSize]);

  // At min size, enforce truncation rather than shrinking into nothing.
  const shouldTruncate = fontSize <= minFontSize;

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ width: "100%", paddingHorizontal }}
    >
      {/* Measurement pass: render without numberOfLines so we can see true line count */}
      {containerWidth != null && measuredLines == null && (
        <Text
          style={[style, { fontSize }]}
          // onTextLayout fires with the computed lines for this font size and width
          onTextLayout={(e) => setMeasuredLines(e.nativeEvent.lines.length)}
        >
          {text}
        </Text>
      )}

      {/* Final pass: render the actual visible text */}
      {measuredLines != null && (
        <Text
          style={[style, { fontSize }]}
          numberOfLines={shouldTruncate ? maxLines : undefined}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
      )}
    </View>
  );
}
