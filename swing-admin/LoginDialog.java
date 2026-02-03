import javax.swing.*;
import java.awt.*;

/**
 * Login/logout dialog for the Swing admin app.
 *
 * Responsibilities (as per planning docs):
 * - Login form UI (username/password fields)
 * - Login/logout buttons and event handlers
 * - Authentication state display
 * - Uses HTTPClient (which manages the session cookie)
 *
 * Note: Network calls run via SwingWorker to avoid freezing the UI.
 */
public class LoginDialog extends JDialog {
    public interface Listener {
        void onLoggedIn();
        void onLoggedOut();
    }

    private final HTTPClient client;
    private final Listener listener;

    private final JTextField usernameField = new JTextField(14);
    private final JPasswordField passwordField = new JPasswordField(14);
    private final JButton loginBtn = new JButton("Login");
    private final JButton logoutBtn = new JButton("Logout");
    private final JLabel statusLabel = new JLabel("Not logged in");

    public LoginDialog(Frame owner, HTTPClient client, Listener listener) {
        super(owner, "Admin Login", true);
        this.client = client;
        this.listener = listener;
        buildUI();
        bindState();
    }

    private void buildUI() {
        setDefaultCloseOperation(WindowConstants.HIDE_ON_CLOSE);
        setLayout(new BorderLayout(10, 10));

        JPanel form = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(4, 4, 4, 4);
        gbc.anchor = GridBagConstraints.WEST;
        gbc.gridx = 0;
        gbc.gridy = 0;
        form.add(new JLabel("Username"), gbc);
        gbc.gridx = 1;
        form.add(usernameField, gbc);

        gbc.gridx = 0;
        gbc.gridy = 1;
        form.add(new JLabel("Password"), gbc);
        gbc.gridx = 1;
        form.add(passwordField, gbc);

        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        buttons.add(loginBtn);
        buttons.add(logoutBtn);

        JPanel south = new JPanel(new BorderLayout());
        south.add(statusLabel, BorderLayout.WEST);
        south.add(buttons, BorderLayout.EAST);

        add(form, BorderLayout.CENTER);
        add(south, BorderLayout.SOUTH);

        loginBtn.addActionListener(e -> login());
        logoutBtn.addActionListener(e -> logout());

        pack();
        setLocationRelativeTo(getOwner());
    }

    public void open() {
        bindState();
        setVisible(true);
    }

    private void bindState() {
        boolean loggedIn = client.isLoggedIn();
        loginBtn.setEnabled(!loggedIn);
        logoutBtn.setEnabled(loggedIn);
        usernameField.setEnabled(!loggedIn);
        passwordField.setEnabled(!loggedIn);
        statusLabel.setText(loggedIn ? "Logged in" : "Not logged in");
    }

    private void login() {
        loginBtn.setEnabled(false);
        statusLabel.setText("Logging in...");
        new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                client.login(usernameField.getText(), new String(passwordField.getPassword()));
                return null;
            }

            @Override
            protected void done() {
                try {
                    get();
                    statusLabel.setText("Logged in");
                    if (listener != null) listener.onLoggedIn();
                    setVisible(false);
                } catch (Exception ex) {
                    statusLabel.setText("Login failed");
                    JOptionPane.showMessageDialog(LoginDialog.this, ex.getMessage());
                } finally {
                    bindState();
                }
            }
        }.execute();
    }

    private void logout() {
        logoutBtn.setEnabled(false);
        statusLabel.setText("Logging out...");
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
                    statusLabel.setText("Not logged in");
                    if (listener != null) listener.onLoggedOut();
                    setVisible(false);
                } catch (Exception ex) {
                    statusLabel.setText("Logout failed");
                    JOptionPane.showMessageDialog(LoginDialog.this, ex.getMessage());
                } finally {
                    bindState();
                }
            }
        }.execute();
    }
}

