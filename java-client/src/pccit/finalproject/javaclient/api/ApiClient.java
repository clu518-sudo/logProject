package pccit.finalproject.javaclient.api;

import pccit.finalproject.javaclient.http.ApiHttpClient;
import pccit.finalproject.javaclient.model.LoginResult;
import pccit.finalproject.javaclient.model.User;
import pccit.finalproject.javaclient.util.JsonHelper;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Executor;

/**
 * Client for the Node.js backend API. Handles login (with cookie storage),
 * logout, fetching user list (admin), deleting a user, and fetching avatar image.
 */
public class ApiClient {

    private static final String LOGIN_PATH = "/api/login";
    private static final String LOGOUT_PATH = "/api/logout";
    private static final String ADMIN_USERS_PATH = "/api/users";
    private static final String USER_AVATAR_PATH = "/api/users/%d/avatar";

    private final ApiHttpClient http;
    private final Executor executor;

    public ApiClient(String baseUrl) {
        this.http = new ApiHttpClient(baseUrl);
        this.executor = java.util.concurrent.Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r, "api-client");
            t.setDaemon(true);
            return t;
        });
    }

    /**
     * POST /api/login with JSON body. Cookie is stored by HttpClient's CookieManager.
     * Returns success with isAdmin flag, or failure with error message.
     */
    public LoginResult login(String username, String password) {
        if (username == null || password == null) {
            return LoginResult.failure("Missing credentials");
        }
        String body = "{\"username\":\"" + escapeJson(username.trim()) + "\",\"password\":\"" + escapeJson(password) + "\"}";
        try {
            var response = http.postJson(LOGIN_PATH, body);
            if (response.statusCode() == 200) {
                boolean admin = JsonHelper.getIsAdmin(response.body());
                return LoginResult.success(admin);
            }
            if (response.statusCode() == 401 || response.statusCode() == 400) {
                return LoginResult.failure(JsonHelper.getErrorMessage(response.body()));
            }
            return LoginResult.failure("Login failed (status " + response.statusCode() + ")");
        } catch (IOException | InterruptedException e) {
            return LoginResult.failure("Connection error: " + e.getMessage());
        }
    }

    /**
     * POST /api/logout. Clears session cookie.
     */
    public void logout() {
        try {
            http.postNoBody(LOGOUT_PATH);
        } catch (IOException | InterruptedException ignored) {
            // best effort
        }
    }

    /**
     * GET /api/admin/users. Requires prior login as admin. Returns list of users or empty on error.
     */
    public List<User> getUsers() {
        try {
            var response = http.get(ADMIN_USERS_PATH);
            if (response.statusCode() == 200) {
                return JsonHelper.parseUserList(response.body());
            }
            return Collections.emptyList();
        } catch (IOException | InterruptedException e) {
            return Collections.emptyList();
        }
    }

    /**
     * DELETE /api/admin/users/:id. Requires prior login as admin. Returns true if 204.
     */
    public boolean deleteUser(int userId) {
        try {
            var response = http.delete(ADMIN_USERS_PATH + "/" + userId);
            return response.statusCode() == 204;
        } catch (IOException | InterruptedException e) {
            return false;
        }
    }

    /**
     * Fetches avatar image in the background and notifies callback on completion.
     * Does not block the calling thread (e.g. Swing EDT).
     */
    public void fetchAvatarAsync(int userId, AvatarCallback callback) {
        String path = String.format(USER_AVATAR_PATH, userId);
        executor.execute(() -> {
            try {
                var response = http.getBytes(path);
                if (response.statusCode() == 200 && response.body() != null && response.body().length > 0) {
                    callback.onAvatarLoaded(response.body());
                } else {
                    callback.onAvatarError("Failed to load image");
                }
            } catch (Exception e) {
                callback.onAvatarError(e.getMessage());
            }
        });
    }

    public interface AvatarCallback {
        void onAvatarLoaded(byte[] imageBytes);
        void onAvatarError(String message);
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }
}
