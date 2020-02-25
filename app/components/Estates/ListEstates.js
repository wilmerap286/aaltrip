import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { Image } from "react-native-elements";
import * as firebase from "firebase";

export default function ListEstates(props) {
  const { estates, isLoading, handledLoadMore, navigation } = props;
  return (
    <View>
      {estates ? (
        <FlatList
          data={estates}
          renderItem={estate => (
            <Estate estate={estate} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={handledLoadMore}
          onEndReachedThreshold={0}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loadingEstate}>
          <ActivityIndicator size="large" />
          <Text>Cargando Propiedades</Text>
        </View>
      )}
    </View>
  );
}

function Estate(props) {
  const { estate, navigation } = props;
  const { name, address, description, images } = estate.item.estate;
  const [imageEstate, setImageEstate] = useState("");

  useEffect(() => {
    const image = images[0];
    firebase
      .storage()
      .ref(`estates-images/${image}`)
      .getDownloadURL()
      .then(result => {
        setImageEstate(result);
      });
  });

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Estate", { estate: estate.item.estate })
      }
    >
      <View style={styles.viewEstate}>
        <View style={styles.viewEstateImage}>
          <Image
            resizeMode="cover"
            source={{ uri: imageEstate }}
            style={styles.imageEstate}
            PlaceholderContent={<ActivityIndicator color="#fff" />}
          />
        </View>
        <View>
          <Text style={styles.estateName}>{name}</Text>
          <Text style={styles.estateAddress}>{address}</Text>
          <Text style={styles.estateDescription}>
            {description.substr(0, 60)}...
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FooterList(props) {
  const { isLoading } = props;
  if (isLoading) {
    return (
      <View style={styles.loadingEstates}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    return (
      <View style={styles.notFoundEstates}>
        <Text>No quedan propiedades por cargar</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingEstate: {
    marginTop: 20,
    alignItems: "center"
  },
  viewEstate: {
    flexDirection: "row",
    margin: 10
  },
  viewEstateImage: {
    marginRight: 15
  },
  imageEstate: {
    width: 80,
    height: 80
  },
  estateName: {
    fontWeight: "bold"
  },
  estateAddress: {
    paddingTop: 2,
    color: "grey"
  },
  estateDescription: {
    paddingTop: 2,
    color: "grey",
    width: 300
  },
  loadingEstates: {
    marginTop: 10,
    marginBottom: 10
  },
  notFoundEstates: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center"
  }
});
