import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ChatScreen from "../../screens/chat/ChatScreen";
import ConversationScreen from "../../screens/chat/ConversationScreen";

const Stack = createStackNavigator();

export default function ChatStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );
}



