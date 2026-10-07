import { useEffect, useState } from 'react';
import { menuAPI } from '../services/api';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'breakfast',
    items: [{ name: '', category: 'common', estimatedQuantity: '' }],
    mealCategory: 'common',
    description: '',
    isPublished: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadMenus = async () => {
    try {
      const { data } = await menuAPI.getAll({ week: 'true' });
      setMenus(data.menus || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { name: '', category: 'common', estimatedQuantity: '' }],
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  };

  const removeItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validItems = form.items.filter((i) => i.name.trim());
      const payload = { ...form, items: validItems };
      if (editingId) await menuAPI.update(editingId, payload);
      else await menuAPI.create(payload);
      setMessage(editingId ? 'Menu updated successfully!' : 'Menu created successfully!');
      setEditingId(null);

      setForm({
        ...form,
        items: [{ name: '', category: 'common', estimatedQuantity: '' }],
      });
      loadMenus();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editMenu = (menu) => {
    setEditingId(menu._id);
    setForm({
      date: new Date(menu.date).toISOString().split('T')[0],
      mealType: menu.mealType,
      items: menu.items?.length ? menu.items : [{ name: '', category: 'common' }],
      mealCategory: menu.mealCategory || 'common',
      description: menu.description || '',
      isPublished: !!menu.isPublished,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePublish = async (menu) => {
    await menuAPI.publish(menu._id, !menu.isPublished);
    loadMenus();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu?')) return;
    await menuAPI.delete(id);
    loadMenus();
  };

  return (
    <div className="menu-mgmt-page container">
      <div className="page-header">
        <h1>Menu Management</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <h2>{editingId ? 'Edit Menu' : 'Add Menu'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Meal Type</label>
            <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Meal Category</label>
            <select value={form.mealCategory} onChange={(e) => setForm({ ...form, mealCategory: e.target.value })}>
              <option value="common">Common</option><option value="vegetarian">Vegetarian</option><option value="non-vegetarian">Non-Vegetarian</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional meal notes" />
          </div>
          <label><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Publish menu</label>
        </div>

        <h3>Food Items</h3>
        {form.items.map((item, i) => (
          <div key={i} className="form-row item-row">
            <div className="form-group flex-2">
              <input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(i, 'name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <select value={item.category} onChange={(e) => updateItem(i, 'category', e.target.value)}>
                <option value="common">Common</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
              </select>
            </div>
            <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(i)}>✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>+ Add Item</button>
        <br /><br />
        <button type="submit" className="btn btn-primary" disabled={loading}>{editingId ? 'Update Menu' : 'Save Menu'}</button>
        {editingId && <button type="button" className="btn btn-outline" onClick={() => setEditingId(null)}>Cancel Edit</button>}
      </form>

      <div className="table-card">
        <h2>This Week&apos;s Menus</h2>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Meal</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu) => (
                <tr key={menu._id}>
                  <td>{new Date(menu.date).toLocaleDateString()}</td>
                  <td>{menu.mealType}</td>
                  <td>{menu.items.map((i) => i.name).join(', ')}</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => editMenu(menu)}>Edit</button>{' '}
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => togglePublish(menu)}>{menu.isPublished ? 'Unpublish' : 'Publish'}</button>{' '}
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(menu._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
