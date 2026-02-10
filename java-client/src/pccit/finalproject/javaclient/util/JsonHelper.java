package pccit.finalproject.javaclient.util;

import pccit.finalproject.javaclient.model.User;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Minimal JSON parsing for API responses. Used to avoid external JSON library dependency.
 * Handles only the shapes returned by our backend (login response, error object, user array).
 */
public final class JsonHelper {

    private static final Pattern QUOTED_STRING = Pattern.compile("\"([^\"]*)\"");
    private static final Pattern BOOLEAN = Pattern.compile("\"(isAdmin)\"\\s*:\\s*(true|false)");
    private static final Pattern ERROR_MESSAGE = Pattern.compile("\"message\"\\s*:\\s*\"([^\"]*)\"");

    /** Extract boolean value for key "isAdmin" from JSON object. */
    public static boolean getIsAdmin(String json) {
        Matcher m = BOOLEAN.matcher(json);
        return m.find() && "true".equals(m.group(2));
    }

    /** Extract "message" from nested error object: { "error": { "message": "..." } }. */
    public static String getErrorMessage(String json) {
        Matcher m = ERROR_MESSAGE.matcher(json);
        return m.find() ? unescape(m.group(1)) : "Unknown error";
    }

    /** Parse array of user objects into List&lt;User&gt;. */
    public static List<User> parseUserList(String json) {
        List<User> list = new ArrayList<>();
        if (json == null || json.isBlank()) return list;
        // Find each object in the array by matching balanced braces.
        int start = json.indexOf('[');
        if (start == -1) return list;
        int depth = 0;
        int objStart = -1;
        for (int i = start + 1; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '{') {
                if (depth == 0) objStart = i;
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0 && objStart != -1) {
                    String obj = json.substring(objStart, i + 1);
                    User u = parseUserObject(obj);
                    if (u != null) list.add(u);
                }
            } else if (c == '[') {
                depth++;
            } else if (c == ']') {
                depth--;
            }
        }
        return list;
    }

    private static User parseUserObject(String obj) {
        int id = getInt(obj, "id");
        String username = getString(obj, "username");
        String realName = getString(obj, "realName");
        String dob = getString(obj, "dob");
        String bio = getString(obj, "bio");
        String avatarType = getString(obj, "avatarType");
        String avatarKey = getString(obj, "avatarKey");
        String avatarPath = getString(obj, "avatarPath");
        boolean isAdmin = getBoolean(obj, "isAdmin");
        int articleCount = getInt(obj, "articleCount");
        return new User(id, username, realName, dob, bio, avatarType, avatarKey, avatarPath, isAdmin, articleCount);
    }

    private static int getInt(String obj, String key) {
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*(-?\\d+)");
        Matcher m = p.matcher(obj);
        return m.find() ? Integer.parseInt(m.group(1)) : 0;
    }

    private static boolean getBoolean(String obj, String key) {
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*(true|false)");
        Matcher m = p.matcher(obj);
        return m.find() && "true".equals(m.group(1));
    }

    private static String getString(String obj, String key) {
        // Match "key":"value" - value may contain escaped quotes
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\[\"\\\\/bfnrtu])*)\"");
        Matcher m = p.matcher(obj);
        return m.find() ? unescape(m.group(1)) : "";
    }

    private static String unescape(String s) {
        if (s == null) return "";
        return s.replace("\\n", "\n").replace("\\r", "\r").replace("\\t", "\t")
                .replace("\\\"", "\"").replace("\\\\", "\\");
    }
}
