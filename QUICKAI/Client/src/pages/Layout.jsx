// import React, { useState } from 'react'
// import { Outlet, useNavigate } from 'react-router-dom'
// import { assets } from '../assets/assets'
// import { Menu, X } from 'lucide-react';
// import Sidebar from '../components/Sidebar'
// import { SignIn, useUser} from '@clerk/clerk-react';

// const Layout = () => {

//   const navigate = useNavigate();
//   const [sidebar,setSidebar] = useState(false);
//   const {user} = useUser();

//   return user ?  (
//     <div className='flex flex-col items-start justify-start h-screen'>
//       <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
//         <img className='cursor-pointer w-32 sm:w-44' src={assets.logo} alt="" onClick={() => navigate("/")} />
//         {
//            sidebar ? <X onClick={() => setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden' />
//            : <Menu onClick={() => setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden'/>
//         }
//       </nav>

//       <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
//         <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
//         <div className='flex-1 bg-[#F4F7FB]'>
//           <Outlet/>
//         </div>
//       </div>

//     </div>
//   ) : (
//     <div className='flex items-center justify-center h-screen'>
//       <SignIn />
//       {/* <useUser/> */}
      
//     </div>
//   )
// }

// export default Layout
import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return user ? (
    <div className='flex flex-col h-screen'>
      {/* Top Navbar */}
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200 bg-white'>
        <img
          className='cursor-pointer w-32 sm:w-44'
          src={assets.logo}
          alt='logo'
          onClick={() => navigate('/')}
        />
        {/* Mobile menu toggle */}
        {sidebar ? (
          <X
            onClick={() => setSidebar(false)}
            className='w-6 h-6 text-gray-600 sm:hidden'
          />
        ) : (
          <Menu
            onClick={() => setSidebar(true)}
            className='w-6 h-6 text-gray-600 sm:hidden'
          />
        )}
      </nav>

      <div className='flex flex-1 h-[calc(100vh-56px)]'>
        {/* Sidebar - Desktop */}
        <div className='hidden sm:block w-64 border-r bg-white'>
          <Sidebar />
        </div>

        {/* Sidebar - Mobile Overlay with Slide Animation */}
        {sidebar && (
          <div className=' fixed inset-0 z-50 flex sm:hidden'>
            {/* Sidebar */}
            <div
              className={`w-64 bg-white border-r transform transition-transform duration-300 ease-in-out translate-x-0`}
            >
              <Sidebar />
            </div>
            {/* Dark background to close */}
            <div
              className='flex-1  bg-gray-100 bg-opacity-50'
              onClick={() => setSidebar(false)}
            ></div>
          </div>
        )}

        {/* Main Content */}
        <div className='flex-1 bg-[#F4F7FB] overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}

export default Layout