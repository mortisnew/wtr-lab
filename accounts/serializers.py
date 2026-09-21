from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from accounts.models import UserModel

class UserRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    class Meta:
        model = UserModel
        fields = ('username','email','password','password2')
        extra_kwargs = {'password':
                            {'write_only': True}}
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError('Passwords must match.')
        if attrs.get('username') == 'admin':
            raise serializers.ValidationError('Username Cant be admin.')
        if attrs.get('username') == 'manager':
            raise serializers.ValidationError('Username Cant be manager.')
        return attrs

    def create(self, validated_data):
        password2 = validated_data.pop('password2')
        user = UserModel(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('id','username','email','is_staff','is_active','date_joined','last_login')


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['email'] = user.email

        return token