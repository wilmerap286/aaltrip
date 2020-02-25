import React from "react";
import { Icon } from "react-native-elements";
import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";

import EstatesScreenStack from "./EstatesStack";
import TopListScreenStack from "./TopListStack";
import SearchScreenStack from "./SearchStack";
import AccountScreenStack from "./Account/MyAccountStack";
import FavoritesScreenStack from "./FavoritesStcak";

const NavigationStacks = createBottomTabNavigator(
  {
    Estates: {
      screen: EstatesScreenStack,
      navigationOptions: () => ({
        tabBarLabel: "Propiedades",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material-community"
            name="office-building"
            size={22}
            color={tintColor}
          />
        )
      })
    },
    Favorites: {
      screen: FavoritesScreenStack,
      navigationOptions: () => ({
        tabBarLabel: "Favoritas",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material-community"
            name="heart-outline"
            size={22}
            color={tintColor}
          />
        )
      })
    },
    TopList: {
      screen: TopListScreenStack,
      navigationOptions: () => ({
        tabBarLabel: "Ranking",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material-community"
            name="star-outline"
            size={22}
            color={tintColor}
          />
        )
      })
    },
    Search: {
      screen: SearchScreenStack,
      navigationOptions: () => ({
        tabBarLabel: "Buscar",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material-community"
            name="magnify"
            size={22}
            color={tintColor}
          />
        )
      })
    },
    Account: {
      screen: AccountScreenStack,
      navigationOptions: () => ({
        tabBarLabel: "Cuenta",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material-community"
            name="account-circle-outline"
            size={22}
            color={tintColor}
          />
        )
      })
    }
  },
  {
    initialRouteName: "Estates",
    order: ["Estates", "Favorites", "TopList", "Search", "Account"],
    tabBarOptions: {
      inactiveTintColor: "#646464",
      activeTintColor: "#00a680"
    }
  }
);

export default createAppContainer(NavigationStacks);
