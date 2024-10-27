import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Swiper from "react-native-swiper";
import useHomeViewModel from "@/components/src/view-models/home-view-model";
import MissingPerson from "@/components/src/models/missing-person";
import { API_URL_ACESS_FILE, PAGINATION } from "@/enviroments";
import Icon from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { formatDate } from "@/components/src/utils/date-formatter";
import { getStatusColor } from "@/components/src/utils/color-for-status";
import LoginRegisterModal from "@/components/src/components/model-login";

const { width: screenWidth } = Dimensions.get("window");


export default function HomeScreen() {
  const {
    missingPersons,
    loading,
    error,
    fetchMissingPersons,
    loadMore,
    loadingMore,
    hasMore,
    page,
    setPage,
    setHasMore,
  } = useHomeViewModel();
  const [refreshing, setRefreshing] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    PoppinsBold: require("../../assets/fonts/Poppins-Bold.ttf"),
    PoppinsRegular: require("../../assets/fonts/Poppins-Regular.ttf"),
  });

  const [isFollowing, setIsFollowing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const onRefresh = () => {
    setRefreshing(true);
    setPage(PAGINATION.page);
    setHasMore(true);
    fetchMissingPersons(PAGINATION.page).finally(() => setRefreshing(false));
  };

  const handleFollowCase = (caseId: number) => {
    setIsFollowing((prev) => !prev); 
    //console.log("Antes de abrir o modal:", modalVisible);
    setModalVisible(true);
    //console.log(`Caso ${caseId} ${isFollowing ? "desseguido" : "seguido"}`);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F02A4B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar os dados.</Text>
      </View>
    );
  }

  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        {loadingMore && <ActivityIndicator size="large" color="#F02A4B" />}
      </View>
    );
  };

  const renderItem = ({ item }: { item: MissingPerson }) => {
    const imageUrls = getValidImageUrls(item);

    return (
      <View style={styles.card}>
        <Swiper
          style={styles.swiper}
          showsPagination
          activeDotColor="#F02A4B"
          loop
        >
          {imageUrls.map((imageUrl, index) => (
            <View key={index} style={styles.slide}>
              <Image
                source={{ uri: `${API_URL_ACESS_FILE}${imageUrl}` }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </Swiper>
        <View style={styles.details}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.disappearance_date)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon name="person" size={20} color="#555" style={styles.icon} />
            <Text style={styles.name}>{item.name}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon
              name="location-sharp"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <Text style={styles.location}>
              Última localização: {item.last_location}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Icon
              name="information-circle"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: getStatusColor(item.status.name) },
                ]}
              >
                {" " + item.status.name}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <TouchableOpacity onPress={() => handleFollowCase(item.id)}>
              <Icon
                name={isFollowing ? "notifications" : "notifications-outline"}
                size={24}
                color={isFollowing ? "#F02A4B" : "#555"}
              />
            </TouchableOpacity>
            <Text style={styles.followText}>
              {isFollowing ? "Seguindo" : "Seguir"}
            </Text>
            <View style={styles.commentSection}>
              <Icon name="chatbubble-outline" size={24} color="#555" />
              <Text style={styles.commentText}>10 comentários</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={missingPersons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhuma pessoa desaparecida encontrada.
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      <LoginRegisterModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
      />
    </View>
  );
}

const getValidImageUrls = (item: MissingPerson): string[] => {
  return [
    item.first_photo,
    item.second_photo,
    item.third_photo,
    item.fourth_photo,
  ].filter(Boolean);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 1,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 1,
    width: screenWidth * 0.94,
    alignSelf: "center",
  },
  swiper: {
    height: 250,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselImage: {
    width: screenWidth * 0.95,
    height: 250,
    resizeMode: "contain",
    elevation: 10,
  },
  details: {
    padding: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
    color: "#555",
  },
  name: {
    fontSize: 14,
    color: "#2C3E50",
    fontFamily: "PoppinsBold",
  },
  location: {
    fontSize: 12,
    color: "#000",
    fontFamily: "PoppinsRegular",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -2,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: "PoppinsRegular",
    color: "#000",
  },
  statusValue: {
    fontSize: 12,
    fontFamily: "PoppinsRegular",
  },
  footer: {
    height: 100,
  },
  followText: {
    fontSize: 14,
    color: "#F02A4B",
    marginLeft: 8,
  },
  commentSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  commentText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    color: "#999",
    marginTop: 50,
    fontFamily: "SpaceMono",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  errorText: {
    fontSize: 18,
    color: "#D9534F",
    textAlign: "center",
    fontFamily: "PoppinsRegular",
  },
  dateContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 11,
    color: "#7F8C8D",
    fontFamily: "PoppinsRegular",
  },
});
