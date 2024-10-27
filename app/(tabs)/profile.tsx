import { View, Text } from 'react-native'
import React from 'react'
import { useAuth } from '@/components/src/context/auth-context'

const Profile: React.FC = () => {
  const { user } = useAuth();

  console.log("user logado", user)

  return (
    <View>
      <Text>Profile</Text>
    </View>
  )
}

export default Profile 