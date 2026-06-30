import axiosClient from "../api/axiosClient.js";
import { POST_ENDPOINTS } from "../api/endpoints.js";

function buildPostFormData(postData) {
    const formData = new FormData();

    if (postData.title) formData.append("title", postData.title);
    if (postData.description) formData.append("description", postData.description);
    if (postData.eventTime) formData.append("eventTime", postData.eventTime);
    if (postData.userId) formData.append("userId", postData.userId);
    if (postData.phone) formData.append("phone", postData.phone);
    if (postData.name) formData.append("name", postData.name);
    formData.append("hidePostType", postData.hidePostType || "PUBLIC");
    if (postData.address) formData.append("address", postData.address);
    if (postData.city) formData.append("city", postData.city);
    if (postData.district) formData.append("district", postData.district);

    if (postData.latitude) formData.append("latitude", postData.latitude);
    if (postData.longitude) formData.append("longitude", postData.longitude);
    if (postData.locationLevel !== undefined) formData.append("locationLevel", postData.locationLevel);

    if (postData.image) {
        formData.append("image", postData.image);
    }

    if (postData.customQuestionsJson) {
        formData.append("customQuestionsJson", postData.customQuestionsJson);
    }

    return formData;
}

export function createLostPost(postData) {
    const formData = buildPostFormData(postData);
    return axiosClient.post(POST_ENDPOINTS.createLost, formData, {
        headers: { "Content-Type": null }
    });
}

export function createFoundPost(postData) {
    const formData = buildPostFormData(postData);
    return axiosClient.post(POST_ENDPOINTS.createFound, formData, {
        headers: { "Content-Type": null }
    });
}

export function suggestQuestions(description, image) {
    const formData = new FormData();
    formData.append("description", description || "");
    if (image) {
        formData.append("image", image);
    }
    return axiosClient.post(POST_ENDPOINTS.suggestQuestions, formData, {
        headers: { "Content-Type": null }
    });
}

export function generateDescription(image) {
    const formData = new FormData();
    if (image) {
        formData.append("image", image);
    }
    return axiosClient.post(POST_ENDPOINTS.generateDescription, formData, {
        headers: { "Content-Type": null }
    });
}

export function getAllPosts(params) {
    return axiosClient.get(POST_ENDPOINTS.all, { params });
}

export function searchText(searchPayload) {
    return axiosClient.post(POST_ENDPOINTS.searchText, searchPayload);
}

export function searchImage(formData) {
    return axiosClient.post(POST_ENDPOINTS.searchImage, formData, {
        headers: { "Content-Type": null }
    });
}

export function getPostDetail(id) {
    return axiosClient.get(`${POST_ENDPOINTS.detail}/${id}`);
}

export function getPostVerifications(id) {
    return axiosClient.get(`${POST_ENDPOINTS.detail}/${id}/verifications`);
}

export function claimPost(id, answers) {
    return axiosClient.post(`${POST_ENDPOINTS.detail}/${id}/claim`, { answers });
}

export function getMyPosts(params) {
    return axiosClient.get(POST_ENDPOINTS.myPosts, { params });
}

export function updatePostStatus(id, status) {
    return axiosClient.patch(`${POST_ENDPOINTS.detail}/${id}/status`, null, {
        params: { status }
    });
}

export function deletePost(id) {
    return axiosClient.delete(`${POST_ENDPOINTS.detail}/${id}`);
}
