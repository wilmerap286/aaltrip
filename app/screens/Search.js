import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Image, Text } from "react-native";
import { SearchBar, ListItem, Icon } from "react-native-elements";
import { FireSQL } from "firesql";
import firebase from "firebase/app";
import { useDebouncedCallback } from "use-debounce";

const fireSQL = new FireSQL(firebase.firestore(), { includeId: "id" });

export default function Search(props) {
  const { navigation } = props;
  const [estates, setEstates] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    onSearch();
  }, [search]);

  const [onSearch] = useDebouncedCallback(() => {
    if (search) {
      fireSQL
        .query(`SELECT * FROM estates WHERE name LIKE '${search}'`)
        .then(response => {
          setEstates(response);
        });
    }
  }, 300);

  return (
    <View>
      <SearchBar
        placeholder="Propiedad a Buscar..."
        onChangeText={e => setSearch(e)}
        value={search}
        containerStyle={styles.searchBar}
      />
      {estates.length === 0 ? (
        <NotFoundEstates />
      ) : (
        <FlatList
          data={estates}
          renderItem={estate => (
            <Estate estate={estate} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

function Estate(props) {
  const { estate, navigation } = props;
  const { id, name, images } = estate.item;
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
    <ListItem
      title={name}
      leftAvatar={{ source: { uri: imageEstate } }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() => navigation.navigate("Estate", { estate: estate.item })}
    />
  );
}

function NotFoundEstates() {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Image
        source={require("../../assets/img/no-result-found.png")}
        resizeMode="cover"
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20
  }
});
