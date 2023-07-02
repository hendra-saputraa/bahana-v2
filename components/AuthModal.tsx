"use client";

import {
  useSupabaseClient,
  useSessionContext
} from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect } from 'react';

import useAuthModal from '@/hooks/useAuthModal';

import Modal from './Modal';

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { session } = useSessionContext();
  const { onClose, isOpen } = useAuthModal();
  
  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);
  
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Modal
      title="Hi Siapapun Kamu 👋"
      description="Ekspresikan dirimu melalui sebuah lagu!"
      description2="Masuk atau Buat akun terlebih dahulu yaa"
      isOpen={isOpen}
      onChange={onChange}
    >
      <Auth
        theme="dark"
        providers={["github"]}
        supabaseClient={supabaseClient}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#404040',
                brandAccent: '#eab308'
              },
            },
          },
        }}
        localization={{
          variables: {
            sign_up: {
              email_label: 'Alamat Email',
              password_label: 'Buat Password',
              email_input_placeholder: 'Masukkan email anda',
              password_input_placeholder: 'Masukkan password anda',
              button_label: 'Daftar',
              loading_button_label: 'Sedang mendaftar...',
              social_provider_text: 'Masuk dengan {{provider}}',
              link_text: 'Belum punya akun? Daftar',
              confirmation_text: 'Cek email anda untuk verifikasi'
            },
            sign_in: {
              email_label: 'Alamat Email',
              password_label: 'Password',
              email_input_placeholder: 'Masukkan email anda',
              password_input_placeholder: 'Masukkan password anda',
              button_label: 'Masuk',
              loading_button_label: 'Sedang masuk...',
              social_provider_text: 'Masuk dengan {{provider}}',
              link_text: 'Sudah punya akun? Masuk'
            },
            magic_link: {
              email_input_label: 'Alamat Email',
              email_input_placeholder: 'Masukkan email anda',
              button_label: 'Kirim link ajaib',
              loading_button_label: 'Mengirim link ajaib',
              link_text: 'Kirim link ajaib dengan email',
              confirmation_text: 'Cek email untuk link ajaib'
            },
            forgotten_password: {
              email_label: 'Alamat Email',
              password_label: 'Password',
              email_input_placeholder: 'Masukkan email anda',
              button_label: 'Kirim instruksi reset password',
              loading_button_label: 'Mengirim instruksi reset password...',
              link_text: 'Lupa password anda?',
              confirmation_text: 'Cek email anda untuk reset password'
            },
            update_password: {
              password_label: 'Password Baru',
              password_input_placeholder: 'Masukkan password baru anda',
              button_label: 'Ubah password',
              loading_button_label: 'Mengubah password...',
              confirmation_text: 'Password anda telah berhasil diubah'
            },
            verify_otp: {
              email_input_label: 'Alamat Email',
              email_input_placeholder: 'Masukkan email anda',
              phone_input_label: 'Nomor HP',
              phone_input_placeholder: 'Masukkan nomor HP anda',
              token_input_label: 'Kode OTP',
              token_input_placeholder: 'Masukkan kode OTP anda',
              button_label: 'Verifikasi kode OTP',
              loading_button_label: 'Sedang masuk...'
            },
          },
        }}
      />
    </Modal>
  );
};

export default AuthModal;
