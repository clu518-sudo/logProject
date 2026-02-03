import javax.swing.*;
import javax.swing.event.ListSelectionEvent;
import java.awt.*;

/**
 * User table display panel.
 *
 * Responsibilities (as per planning docs):
 * - JTable with custom model
 * - Row selection handling
 * - Provides access to selected user for parent (AdminApp)
 */
public class UserTablePanel extends JPanel {
    public interface SelectionListener {
        void onUserSelected(UserRow user);
    }

    private final UserTableModel model = new UserTableModel();
    private final JTable table = new JTable(model);
    private SelectionListener selectionListener;

    public UserTablePanel() {
        super(new BorderLayout());

        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        table.getSelectionModel().addListSelectionListener(this::onSelection);

        add(new JScrollPane(table), BorderLayout.CENTER);
    }

    public void setUsers(java.util.List<UserRow> users) {
        model.setUsers(users);
        clearSelection();
    }

    public void setSelectionListener(SelectionListener listener) {
        this.selectionListener = listener;
    }

    public UserRow getSelectedUser() {
        int idx = table.getSelectedRow();
        if (idx < 0) return null;
        return model.getUserAt(idx);
    }

    public boolean hasSelection() {
        return table.getSelectedRow() >= 0;
    }

    public void clearSelection() {
        table.clearSelection();
    }

    private void onSelection(ListSelectionEvent e) {
        if (e.getValueIsAdjusting()) return;
        if (selectionListener == null) return;
        selectionListener.onUserSelected(getSelectedUser());
    }
}

