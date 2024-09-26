import React from 'react';
import { auth } from '@/auth';
import { logout } from '@/actions/logout';
import { LogoutButton } from '@/components/auth/logout-button';
const ProfilePage: React.FC = async () => {
    const session = await auth();


    return (
        <div>
            <h1>Profile Page</h1>
            <p>Welcome to your profile!</p>
            {
                session ? (
                    <div>
                        <p>Your email: {session.user.email}</p>
                        <p>Your name: {session.user.name}</p>
                    </div>
                ) : (
                    <p>You need to be logged in to view this page</p>
                )
            }
            <LogoutButton>Logout</LogoutButton>
        </div>
    );
};

export default ProfilePage;