import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) { }
  // base_url = "https://tpulse-mfa-fe-api.detectpl.com/"
  base_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  getNotificationData(notification_type, unit_id) {
    return this.http.get(this.base_url + "/notifications/?notification_category_id=" + notification_type + '&unit_id=' + unit_id)
  }
  deleteNotification(notification_id, notification_category_id, unit_id) {
    if (notification_id == null) {
      return this.http.delete(this.base_url + "/notifications/?notification_category_id=" + notification_category_id + '&unit_id=' + unit_id)
    }
    else {
      return this.http.delete(this.base_url + "/notifications/?notification_id=" + notification_id + '&unit_id=' + unit_id)
    }
  }
  getNotificationCategories(unit_id) {
    return this.http.get(this.base_url + "/notification_categories/?unit_id=" + unit_id)
  }
  muteNotifications(unit_id, notification_access_id, is_muted) {
    if (notification_access_id == null) {
      return this.http.put(this.base_url + '/notification_access/?unit_id=' + unit_id + '&is_muted=' + is_muted, '')
    }
    else {
      return this.http.put(this.base_url + '/notification_access/?unit_id=' + unit_id + '&notification_category_id=' + notification_access_id + '&is_muted=' + is_muted, '')
    }
  }
  deleteNotifications(unit_id, notification_id) {
      return this.http.delete(this.base_url + '/notifications/?unit_id=' + unit_id + '&notification_id=' + notification_id)
  }
  deleteAllNotifications(unit_id, notification_category_id) {
      return this.http.delete(this.base_url + '/notifications/?unit_id=' + unit_id + '&notification_category_id=' + notification_category_id)
  }
  readNotifications(unit_id, notification_id) {
      return this.http.put(this.base_url + '/mark_notifications_viewed/?unit_id=' + unit_id + '&notification_id=' + notification_id, '')
  }
  readAllNotifications(unit_id, notification_category_id) {
      return this.http.put(this.base_url + '/mark_notifications_viewed/?unit_id=' + unit_id + '&notification_category_id=' + notification_category_id, '')
  }
}
