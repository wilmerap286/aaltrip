import { createStackNavigator } from "react-navigation-stack";
import TopEstatesScreen from "../screens/TopEstates";

const TopListScreenStack = createStackNavigator({
  TopEstates: {
    screen: TopEstatesScreen,
    navigationOptions: () => ({
      title: "Los Mejores"
    })
  }
});

export default TopListScreenStack;
