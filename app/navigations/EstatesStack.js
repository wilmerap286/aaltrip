import { createStackNavigator } from "react-navigation-stack";
import EstatesScreen from "../screens/Estates";
import AddEstateScreen from "../screens/Estates/AddEstate";
import EstateScreen from "../screens/Estates/Estate";
import AddReviewEstateScreen from "../screens/Estates/AddReviewEstate";

const EstatesScreenStack = createStackNavigator({
  Estates: {
    screen: EstatesScreen,
    navigationOptions: () => ({
      title: "Propiedades"
    })
  },
  AddEstate: {
    screen: AddEstateScreen,
    navigationOptions: () => ({
      title: "Agregar Propiedad"
    })
  },
  Estate: {
    screen: EstateScreen,
    navigationOptions: props => ({
      title: props.navigation.state.params.name
    })
  },
  AddReviewEstate: {
    screen: AddReviewEstateScreen,
    navigationOptions: () => ({
      title: "Agregar Opinion"
    })
  }
});

export default EstatesScreenStack;
