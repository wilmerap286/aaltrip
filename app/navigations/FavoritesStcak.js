import React from "react";
import { createStackNavigator } from "react-navigation-stack";
import FavoritesScreen from "../screens/Favorites";

const FavoritesScreenStack = createStackNavigator({
  Favorites: {
    screen: FavoritesScreen,
    navigationOptions: () => ({
      title: "Propiedades Favoritas"
    })
  }
});

export default FavoritesScreenStack;
