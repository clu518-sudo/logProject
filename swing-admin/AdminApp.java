import javax.swing.*;
import javax.swing.event.ListSelectionEvent;
import javax.swing.table.AbstractTableModel;
import java.awt.*;
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

public class AdminApp extends JFrame {
    private String cookie = null;
    private boolean loggedIn = false;

    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginBtn;
    private JButton logoutBtn;
    private JButton deleteBtn;
    private JTable table;
    private UserTableModel tableModel;
    private JLabel selectedUserLabel;
    private JLabel avatarLabel;

    private static final String BASE_URL = "http://localhost:3001";

    public AdminApp() {
        super("PGCIT Admin");
        buildUI();
        bindState();
    }

    private void buildUI() {
        setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        setSize(900, 600);
        setLayout(new BorderLayout());

        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        usernameField = new JTextField(12);
        passwordField = new JPasswordField(12);
        loginBtn = new JButton("Login");
        logoutBtn = new JButton("Logout");
        top.add(new JLabel("Username"));
        top.add(usernameField);
        top.add(new JLabel("Password"));
        top.add(passwordField);
        top.add(loginBtn);
        top.add(logoutBtn);

        tableModel = new UserTableModel();
        table = new JTable(tableModel);
        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        JPanel right = new JPanel(new BorderLayout());
        selectedUserLabel = new JLabel("No user selected", SwingConstants.CENTER);
        avatarLabel = new JLabel("", SwingConstants.CENTER);
        avatarLabel.setPreferredSize(new Dimension(160, 160));
        right.add(selectedUserLabel, BorderLayout.NORTH);
        right.add(avatarLabel, BorderLayout.CENTER);

        deleteBtn = new JButton("Delete selected user");
        right.add(deleteBtn, BorderLayout.SOUTH);

        add(top, BorderLayout.NORTH);
        add(new JScrollPane(table), BorderLayout.CENTER);
        add(right, BorderLayout.EAST);

        loginBtn.addActionListener(e -> login());
        logoutBtn.addActionListener(e -> logout());
        deleteBtn.addActionListener(e -> deleteSelected());
        table.getSelectionModel().addListSelectionListener(this::onSelection);
    }

    private void bindState() {
        loginBtn.setEnabled(!loggedIn);
        logoutBtn.setEnabled(loggedIn);
        deleteBtn.setEnabled(loggedIn && table.getSelectedRow() >= 0);
    }

    private void login() {
        loginBtn.setEnabled(false);
        new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                String payload = "{\"username\":\"" + jsonEscape(usernameField.getText().trim()) +
                        "\",\"password\":\"" + jsonEscape(new String(passwordField.getPassword())) + "\"}";
                HttpURLConnection conn = openConnection("POST", "/api/login", "application/json");
                writeBody(conn, payload);
                int status = conn.getResponseCode();
                if (status != 200) {
                    String err = readString(getStream(conn));
                    throw new RuntimeException("Login failed: " + err);
                }
                String setCookie = getHeaderIgnoreCase(conn, "Set-Cookie");
                if (setCookie != null) {
                    cookie = setCookie.split(";", 2)[0];
                }
                loggedIn = true;
                return null;
            }

            @Override
            protected void done() {
                try {
                    get();
                    fetchUsers();
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(AdminApp.this, ex.getMessage());
                    loggedIn = false;
                } finally {
                    bindState();
                }
            }
        }.execute();
    }

    private void logout() {
        new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                HttpURLConnection conn = openConnection("POST", "/api/logout", null);
                conn.getResponseCode();
                return null;
            }

            @Override
            protected void done() {
                loggedIn = false;
                cookie = null;
                tableModel.setUsers(new ArrayList<>());
                avatarLabel.setIcon(null);
                selectedUserLabel.setText("No user selected");
                bindState();
            }
        }.execute();
    }

    private void fetchUsers() {
        new SwingWorker<List<UserRow>, Void>() {
            @Override
            protected List<UserRow> doInBackground() throws Exception {
                HttpURLConnection conn = openConnection("GET", "/api/users", null);
                int status = conn.getResponseCode();
                String body = readString(getStream(conn));
                if (status != 200) {
                    throw new RuntimeException("Fetch users failed: " + body);
                }
                return parseUsers(body);
            }

            @Override
            protected void done() {
                try {
                    tableModel.setUsers(get());
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(AdminApp.this, ex.getMessage());
                }
                bindState();
            }
        }.execute();
    }

    private void onSelection(ListSelectionEvent e) {
        if (e.getValueIsAdjusting()) return;
        int idx = table.getSelectedRow();
        bindState();
        if (idx < 0) return;
        UserRow user = tableModel.getUserAt(idx);
        selectedUserLabel.setText(user.username);
        fetchAvatar(user.id);
    }

    private void fetchAvatar(int userId) {
        new SwingWorker<ImageIcon, Void>() {
            @Override
            protected ImageIcon doInBackground() throws Exception {
                HttpURLConnection conn = openConnection("GET", "/api/users/" + userId + "/avatar", null);
                int status = conn.getResponseCode();
                if (status != 200) {
                    throw new RuntimeException("Avatar fetch failed");
                }
                byte[] bytes = readBytes(getStream(conn));
                ImageIcon icon = new ImageIcon(bytes);
                Image scaled = icon.getImage().getScaledInstance(120, 120, Image.SCALE_SMOOTH);
                return new ImageIcon(scaled);
            }

            @Override
            protected void done() {
                try {
                    avatarLabel.setIcon(get());
                } catch (Exception ex) {
                    avatarLabel.setIcon(null);
                }
            }
        }.execute();
    }

    private void deleteSelected() {
        int idx = table.getSelectedRow();
        if (idx < 0) return;
        UserRow user = tableModel.getUserAt(idx);
        if (user.isAdmin) {
            JOptionPane.showMessageDialog(this, "Cannot delete admin user.");
            return;
        }
        if (!confirm("Delete user " + user.username + "?")) return;
        new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                HttpURLConnection conn = openConnection("DELETE", "/api/users/" + user.id, null);
                int status = conn.getResponseCode();
                String body = readString(getStream(conn));
                if (status != 204) {
                    throw new RuntimeException("Delete failed: " + body);
                }
                return null;
            }

            @Override
            protected void done() {
                fetchUsers();
            }
        }.execute();
    }

    private boolean confirm(String msg) {
        return JOptionPane.showConfirmDialog(this, msg, "Confirm", JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new AdminApp().setVisible(true));
    }

    private HttpURLConnection openConnection(String method, String path, String contentType) throws IOException {
        URL url = URI.create(BASE_URL + path).toURL();
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

    private void writeBody(HttpURLConnection conn, String body) throws IOException {
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

    private static class UserRow {
        int id;
        String username;
        String realName;
        String dob;
        int articleCount;
        boolean isAdmin;
    }

    private static class UserTableModel extends AbstractTableModel {
        private final String[] columns = {"Username", "Real Name", "DOB", "Articles"};
        private List<UserRow> users = new ArrayList<>();

        public void setUsers(List<UserRow> list) {
            users = list;
            fireTableDataChanged();
        }

        public UserRow getUserAt(int row) {
            return users.get(row);
        }

        @Override
        public int getRowCount() {
            return users.size();
        }

        @Override
        public int getColumnCount() {
            return columns.length;
        }

        @Override
        public String getColumnName(int column) {
            return columns[column];
        }

        @Override
        public Object getValueAt(int rowIndex, int columnIndex) {
            UserRow u = users.get(rowIndex);
            switch (columnIndex) {
                case 0:
                    return u.username;
                case 1:
                    return u.realName;
                case 2:
                    return u.dob;
                case 3:
                    return u.articleCount;
                default:
                    return "";
            }
        }
    }
}
