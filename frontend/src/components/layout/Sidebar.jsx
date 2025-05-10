import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null;
  
  const role = user.user.role;
  
  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
          </li>
          
          {role === 'admin' && (
            <>
              <li>
                <NavLink to="/accountants">
                  Accountants
                </NavLink>
              </li>
              <li>
                <NavLink to="/companies">
                  Companies
                </NavLink>
              </li>
            </>
          )}
          
          {role === 'accountant' && (
            <li>
              <NavLink to="/companies">
                My Companies
              </NavLink>
            </li>
          )}
          
          {role === 'company' && (
            <li>
              <NavLink to={`/documents/${user.profile?.id}`}>
                Documents
              </NavLink>
            </li>
          )}
          
          <li>
            <NavLink to="/profile">
              Profile
            </NavLink>
          </li>
          
          <li>
            <NavLink to="/settings">
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;