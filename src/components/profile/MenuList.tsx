import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import MenuItemCard from "./MenuItemCard";

export interface MenuItem {
  title: string;
  subtitle: string;
  onPress?: () => void;
  showNewBadge?: boolean;
}

export interface MenuListProps {
  items: MenuItem[];
}

const MenuList = memo<MenuListProps>(({ items }) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <MenuItemCard
          key={index}
          title={item.title}
          subtitle={item.subtitle}
          onPress={item.onPress}
          showNewBadge={item.showNewBadge}
        />
      ))}
    </View>
  );
});

MenuList.displayName = "MenuList";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    overflow: "hidden",
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },
});

export default MenuList;
