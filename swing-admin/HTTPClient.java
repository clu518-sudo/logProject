import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Simple HTTP client for the Swing admin app.
 *
 * Responsibilities (as per planning docs):
 * - GET/POST/DELETE helper methods
 * - Cookie/session header management (stores session cookie after login)
 * - JSON request/response handling (minimal, no external JSON libs)
 * - Basic error handling and timeouts
 */
public class HTTPClient {
    private final String baseUrl;
    private String cookie = null;

    public HTTPClient(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public boolean isLoggedIn() {
        return cookie != null && !cookie.isEmpty();
    }

    public void login(String username, String password) throws IOException {
        String payload = "{\"username\":\"" + jsonEscape((username == null ? "" : username.trim())) +
                "\",\"password\":\"" + jsonEscape(password == null ? "" : password) + "\"}";
        HttpURLConnection conn = openConnection("POST", "/api/login", "application/json");
        writeBody(conn, payload);
        int status = conn.getResponseCode();
        String body = readString(getStream(conn));
        if (status != 200) {
            throw new IOException("Login failed: " + body);
        }
        String setCookie = getHeaderIgnoreCase(conn, "Set-Cookie");
        if (setCookie != null) {
            // Keep only the first cookie key=value pair (e.g. "sid=...")
            cookie = setCookie.split(";", 2)[0];
        }
    }

    public void logout() throws IOException {
        HttpURLConnection conn = openConnection("POST", "/api/logout", null);
        conn.getResponseCode(); // fire request
        cookie = null;
    }

    public List<UserRow> fetchUsers() throws IOException {
        HttpURLConnection conn = openConnection("GET", "/api/users", null);
        int status = conn.getResponseCode();
        String body = readString(getStream(conn));
        if (status != 200) {
            throw new IOException("Fetch users failed: " + body);
        }
        return parseUsers(body);
    }

    public byte[] fetchAvatarBytes(int userId) throws IOException {
        HttpURLConnection conn = openConnection("GET", "/api/users/" + userId + "/avatar", null);
        int status = conn.getResponseCode();
        if (status != 200) {
            throw new IOException("Avatar fetch failed");
        }
        return readBytes(getStream(conn));
    }

    public void deleteUser(int userId) throws IOException {
        HttpURLConnection conn = openConnection("DELETE", "/api/users/" + userId, null);
        int status = conn.getResponseCode();
        String body = readString(getStream(conn));
        if (status != 204) {
            throw new IOException("Delete failed: " + body);
        }
    }

    private HttpURLConnection openConnection(String method, String path, String contentType) throws IOException {
        URL url = URI.create(baseUrl + path).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(method);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(20000);
        if (cookie != null && !cookie.isEmpty()) {
            conn.setRequestProperty("Cookie", cookie);
        }
        if (contentType != null) {
            conn.setRequestProperty("Content-Type", contentType);
        }
        return conn;
    }

    private static void writeBody(HttpURLConnection conn, String body) throws IOException {
        conn.setDoOutput(true);
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        conn.setRequestProperty("Content-Length", String.valueOf(bytes.length));
        try (OutputStream out = conn.getOutputStream()) {
            out.write(bytes);
        }
    }

    private static InputStream getStream(HttpURLConnection conn) throws IOException {
        int status = conn.getResponseCode();
        InputStream stream = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
        return stream != null ? stream : new ByteArrayInputStream(new byte[0]);
    }

    private static byte[] readBytes(InputStream in) throws IOException {
        ByteArrayOutputStream bout = new ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        int r;
        while ((r = in.read(buf)) != -1) {
            bout.write(buf, 0, r);
        }
        return bout.toByteArray();
    }

    private static String readString(InputStream in) throws IOException {
        return new String(readBytes(in), StandardCharsets.UTF_8);
    }

    private static String getHeaderIgnoreCase(HttpURLConnection conn, String name) {
        for (Map.Entry<String, List<String>> entry : conn.getHeaderFields().entrySet()) {
            String key = entry.getKey();
            if (key != null && key.equalsIgnoreCase(name)) {
                List<String> values = entry.getValue();
                if (values != null && !values.isEmpty()) {
                    return values.get(0);
                }
            }
        }
        return null;
    }

    private static String jsonEscape(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '\\':
                    sb.append("\\\\");
                    break;
                case '"':
                    sb.append("\\\"");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                case '\t':
                    sb.append("\\t");
                    break;
                default:
                    sb.append(c);
            }
        }
        return sb.toString();
    }

    private static String unescapeJsonString(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        boolean esc = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (esc) {
                switch (c) {
                    case 'n':
                        sb.append('\n');
                        break;
                    case 'r':
                        sb.append('\r');
                        break;
                    case 't':
                        sb.append('\t');
                        break;
                    case '"':
                        sb.append('"');
                        break;
                    case '\\':
                        sb.append('\\');
                        break;
                    default:
                        sb.append(c);
                }
                esc = false;
            } else if (c == '\\') {
                esc = true;
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    private static List<UserRow> parseUsers(String json) {
        List<UserRow> users = new ArrayList<>();
        Matcher m = Pattern.compile("\\{(.*?)\\}", Pattern.DOTALL).matcher(json);
        while (m.find()) {
            String obj = m.group(1);
            UserRow u = new UserRow();
            u.id = parseInt(obj, "\"id\"\\s*:\\s*(\\d+)", 0);
            u.username = parseString(obj, "\"username\"\\s*:\\s*\"(.*?)\"");
            u.realName = parseString(obj, "\"realName\"\\s*:\\s*\"(.*?)\"");
            u.dob = parseString(obj, "\"dob\"\\s*:\\s*\"(.*?)\"");
            u.articleCount = parseInt(obj, "\"articleCount\"\\s*:\\s*(\\d+)", 0);
            u.isAdmin = parseBoolean(obj, "\"isAdmin\"\\s*:\\s*(true|false)", false);
            users.add(u);
        }
        return users;
    }

    private static int parseInt(String src, String regex, int fallback) {
        Matcher m = Pattern.compile(regex, Pattern.DOTALL).matcher(src);
        if (m.find()) {
            try {
                return Integer.parseInt(m.group(1));
            } catch (NumberFormatException ignored) {
            }
        }
        return fallback;
    }

    private static boolean parseBoolean(String src, String regex, boolean fallback) {
        Matcher m = Pattern.compile(regex, Pattern.DOTALL).matcher(src);
        if (m.find()) {
            return Boolean.parseBoolean(m.group(1));
        }
        return fallback;
    }

    private static String parseString(String src, String regex) {
        Matcher m = Pattern.compile(regex, Pattern.DOTALL).matcher(src);
        if (m.find()) {
            return unescapeJsonString(m.group(1));
        }
        return "";
    }
}

