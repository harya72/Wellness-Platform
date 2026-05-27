import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { memo, useEffect, useState } from "react";
import { prettier } from "@utils/utils";
import CustomText from "@components/CustomText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetch } from "src/hooks/useFetch";
import { DEFAULT_PAGE_SIZE } from "src/constants/constants";

const NotificationItem = memo(({ item, handleMarkAsRead }: any) => {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <CustomText style={styles.notificationTitle} font="SemiBold">
              {item.templateName}
            </CustomText>
            <CustomText style={styles.notificationMessage}>
              {item.templateBody}
            </CustomText>
          </View>
          {!item.isRead && (
            <TouchableOpacity
              onPress={() => handleMarkAsRead(item.notificationId)}
            >
              <CustomText style={styles.markReadButtonText}>
                Mark As Read
              </CustomText>
            </TouchableOpacity>
          )}
        </View>
        <CustomText style={styles.notificationDate}>
          {new Date(item.createdAt).toLocaleString()}
        </CustomText>
      </View>
    </View>
  );
});

const Notification = () => {
  const [pageNo, setPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("unread");
  const [notificationList, setNotificationList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const { fetchData } = useFetch<any>({ autoFetch: false });
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (type: string) => {
    try {
      setLoading(true);
      const response = await fetchData(
        `/notification/user/${type}?pageNo=${pageNo}&pageSize=${DEFAULT_PAGE_SIZE}&sortOrder=DESC`,
      );

      if (response?.result?.responseCode === 200) {
        if (pageNo === 0) {
          setNotificationList(response?.data?.list || []);
        } else {
          setNotificationList((prev: any) => [
            ...prev,
            ...(response.data.list || []),
          ]);
        }

        setHasMore(
          response.data.list
            ? response.data.list.length === DEFAULT_PAGE_SIZE
            : false,
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(activeTab);
  }, [activeTab, pageNo]);

  const loadMore = () => {
    if (!loading && hasMore && notificationList.length > 0) {
      setPageNo(pageNo + 1);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPageNo(0);
    await fetchNotifications(activeTab);
    setRefreshing(false);
  };

  const handleTabChange = (type: string) => {
    setNotificationList([]);
    setPageNo(0);
    setActiveTab(type);
  };

  const renderEmpty = () => {
    return (
      !loading && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <CustomText>No Notifications to show</CustomText>
        </View>
      )
    );
  };

  const renderFooter = () => {
    return (
      loading && (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={styles.centered}
        />
      )
    );
  };

  const handleMarkAsRead = async (notificationIds: number | number[]) => {
    try {
      const ids = Array.isArray(notificationIds)
        ? notificationIds
        : [notificationIds];

      const response = await fetchData(
        "/notification/user/mark-read",
        "POST",
        ids,
      );

      if (response?.result?.responseCode === 200) {
        console.log("Notification(s) marked as read successfully");

        if (activeTab === "unread") {
          setNotificationList((prev: any) =>
            ids.length === 0
              ? []
              : prev.filter((item: any) => !ids.includes(item.notificationId)),
          );
        } else if (activeTab === "archive") {
          setNotificationList((prev: any) =>
            prev.map((item: any) =>
              ids.includes(item.notificationId)
                ? { ...item, isRead: true }
                : item,
            ),
          );
        }
        prettier("response", response);
      } else {
        console.warn("No response received");
      }
    } catch (error) {
      console.error("Error marking notification(s) as read:", error);
    }
  };

  const renderContent = () => {
    return (
      <FlatList
        data={notificationList}
        renderItem={({ item }) => (
          <NotificationItem item={item} handleMarkAsRead={handleMarkAsRead} />
        )}
        keyExtractor={(item: any) => item.notificationId.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={renderFooter}
        style={{ flexGrow: 1 }}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "unread" && styles.activeTab]}
          onPress={() => handleTabChange("unread")}
        >
          <CustomText
            style={[
              styles.tabText,
              activeTab === "unread" && styles.activeTabText,
            ]}
          >
            Unread
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "archive" && styles.activeTab]}
          onPress={() => handleTabChange("archive")}
        >
          <CustomText
            style={[
              styles.tabText,
              activeTab === "archive" && styles.activeTabText,
            ]}
          >
            All
          </CustomText>
        </TouchableOpacity>
      </View>
      {activeTab === "unread" && notificationList.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            handleMarkAsRead(
              notificationList.map((item: any) => item.notificationId)
            );
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-end",
            gap: 4,
            padding: 16,
          }}
        >
          <MaterialCommunityIcons name="check-all" size={24} color="#007AFF" />
          <CustomText
            style={[
              styles.markReadButtonText,
              { textDecorationLine: "underline" },
            ]}
          >
            Mark All as Read
          </CustomText>
        </TouchableOpacity>
      )}
      {renderContent()}
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 24,
    color: "#1A1A1A",
  },
  markReadButtonText: {
    fontSize: 14,
    color: "#007AFF",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    paddingVertical: 15,
    width: "50%",
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#8A8A8E",
  },
  activeTabText: {
    color: "#007AFF",
  },
  listContainer: {
    paddingVertical: 10,
    flexGrow: 1,
    paddingBottom: 80,
  },
  notificationItem: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: "#8A8A8E",
    marginTop: 8,
    textAlign: "right",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
