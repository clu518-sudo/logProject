package pccit.finalproject.javaclient.ui;

import pccit.finalproject.javaclient.model.User;

import javax.swing.table.AbstractTableModel;
import java.util.ArrayList;
import java.util.List;

/**
 * TableModel (MVC) for the admin user list. Backed by a list of User objects.
 */
public class UserTableModel extends AbstractTableModel {

    private static final String[] COLUMN_NAMES = { "ID", "Username", "Real Name", "Admin", "Articles" };
    private final List<User> users = new ArrayList<>();

    @Override
    public int getRowCount() {
        return users.size();
    }

    @Override
    public int getColumnCount() {
        return COLUMN_NAMES.length;
    }

    @Override
    public String getColumnName(int column) {
        return COLUMN_NAMES[column];
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        User u = users.get(rowIndex);
        switch (columnIndex) {
            case 0: return u.getId();
            case 1: return u.getUsername();
            case 2: return u.getRealName();
            case 3: return u.isAdmin() ? "Yes" : "No";
            case 4: return u.getArticleCount();
            default: return "";
        }
    }

    @Override
    public Class<?> getColumnClass(int columnIndex) {
        if (columnIndex == 0 || columnIndex == 4) return Integer.class;
        return String.class;
    }

    /** Replace entire user list and notify table to refresh. */
    public void setUsers(List<User> newUsers) {
        users.clear();
        if (newUsers != null) users.addAll(newUsers);
        fireTableDataChanged();
    }

    /** Remove user at row and notify. */
    public void removeUserAt(int row) {
        if (row >= 0 && row < users.size()) {
            users.remove(row);
            fireTableRowsDeleted(row, row);
        }
    }

    /** Get the User at the given row, or null. */
    public User getUserAt(int row) {
        if (row >= 0 && row < users.size()) return users.get(row);
        return null;
    }

    public void clear() {
        users.clear();
        fireTableDataChanged();
    }
}
