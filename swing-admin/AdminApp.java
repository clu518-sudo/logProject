import javax.swing.*;
import java.awt.*;

public class AdminApp extends JFrame {
    private static final String BASE_URL = "http://localhost:3001";
    private final HTTPClient client = new HTTPClient(BASE_URL);

    private final JButton loginBtn = new JButton("Login");
    private final JButton logoutBtn = new JButton("Logout");
    private final JButton deleteBtn = new JButton("Delete selected user");
    private final JLabel statusLabel = new JLabel("Not logged in");

    private final UserTablePanel userTablePanel = new UserTablePanel();
    private final AvatarPanel avatarPanel = new AvatarPanel(client);

    private LoginDialog loginDialog;

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
        top.add(statusLabel);
        top.add(loginBtn);
        top.add(logoutBtn);

        JPanel right = new JPanel(new BorderLayout());
        right.add(avatarPanel, BorderLayout.CENTER);
        right.add(deleteBtn, BorderLayout.SOUTH);

        add(top, BorderLayout.NORTH);
        add(userTablePanel, BorderLayout.CENTER);
        add(right, BorderLayout.EAST);

        loginDialog = new LoginDialog(this, client, new LoginDialog.Listener() {
            @Override
            public void onLoggedIn() {
                statusLabel.setText("Logged in");
                fetchUsers();
                bindState();
            }

            @Override
            public void onLoggedOut() {
                statusLabel.setText("Not logged in");
                clearAll();
                bindState();
            }
        });

        loginBtn.addActionListener(e -> loginDialog.open());
        logoutBtn.addActionListener(e -> logout());
        deleteBtn.addActionListener(e -> deleteSelected());

        userTablePanel.setSelectionListener((user) -> {
            avatarPanel.showUser(user);
            bindState();
        });
    }

    private void bindState() {
        boolean loggedIn = client.isLoggedIn();
        loginBtn.setEnabled(!loggedIn);
        logoutBtn.setEnabled(loggedIn);
        deleteBtn.setEnabled(loggedIn && userTablePanel.hasSelection());
        if (!loggedIn) statusLabel.setText("Not logged in");
    }

    private void clearAll() {
        userTablePanel.setUsers(new java.util.ArrayList<>());
        avatarPanel.clear();
    }

    private void logout() {
        logoutBtn.setEnabled(false);
        new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                client.logout();
                return null;
            }

            @Override
            protected void done() {
                try {
                    get();
                } catch (Exception ignored) {
                }
                clearAll();
                bindState();
            }
        }.execute();
    }

    private void fetchUsers() {
        new SwingWorker<java.util.List<UserRow>, Void>() {
            @Override
            protected java.util.List<UserRow> doInBackground() throws Exception {
                return client.fetchUsers();
            }

            @Override
            protected void done() {
                try {
                    userTablePanel.setUsers(get());
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(AdminApp.this, ex.getMessage());
                } finally {
                    bindState();
                }
            }
        }.execute();
    }

    private void deleteSelected() {
        UserRow user = userTablePanel.getSelectedUser();
        if (user == null) return;
        if (user.isAdmin) {
            JOptionPane.showMessageDialog(this, "Cannot delete admin user.");
            return;
        }
        if (!confirm("Delete user " + user.username + "?")) return;

        deleteBtn.setEnabled(false);
        new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                client.deleteUser(user.id);
                return null;
            }

            @Override
            protected void done() {
                try {
                    get();
                    fetchUsers();
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(AdminApp.this, ex.getMessage());
                    bindState();
                }
            }
        }.execute();
    }

    private boolean confirm(String msg) {
        return JOptionPane.showConfirmDialog(this, msg, "Confirm", JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new AdminApp().setVisible(true));
    }
}
