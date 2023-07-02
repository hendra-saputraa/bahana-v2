"use client";

import uniqid from 'uniqid';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useUser } from '@/hooks/useUser';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';

import Modal from './Modal';
import Input from './Input';
import Button from './Button';

import useUploadModal from '@/hooks/useUploadModal';

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset
  } = useForm<FieldValues>({
    defaultValues: {
      author: '',
      title: '',
      song: null,
      image: null,
    }
  });

  const onChange = (open: boolean) => {
    if(!open) {
      reset();
      uploadModal.onClose();
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);
      
      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];
      
      if (!imageFile || !songFile || !user) {
        toast.error("Masih ada yang belum terisi!");
        return;
      }
      
      const uniqueID = uniqid();
      
      // Songs upload
      const {
        data: songData,
        error: songError,
      } = await supabaseClient
        .storage
        .from('songs')
        .upload(`song-${values.title}-${uniqueID}`, songFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (songError) {
        setIsLoading(false);
        return toast.error("Gagal mengunggah musik.");
      }
      
      // Images upload
      const {
        data: imageData,
        error: imageError,
      } = await supabaseClient
        .storage
        .from('images')
        .upload(`image-${values.title}-${uniqueID}`, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (imageError) {
        setIsLoading(false);
        return toast.error("Gagal mengunggah cover.");
      }
      
      const {
        error: supabaseError
      } = await supabaseClient
        .from('songs')
        .insert({
          user_id: user.id,
          title: values.title,
          author: values.author,
          image_path: imageData.path,
          song_path: songData.path
        });
        
      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }
      
      router.refresh();
      setIsLoading(false);
      toast.success("Berhasil menambahkan musik!");
      reset();
      uploadModal.onClose();
    } catch (error) {
      toast.error("Ada yang salah, mohon coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Tambah Musik Kesukaanmu!"
      description="Unggah dengan format mp3"
      description2="Gunakan cover yang sesuai dengan lagu! Boleh meme dsb"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <Input
          id="title"
          disabled={isLoading}
          {...register('title', { required: true })}
          placeholder="Judul musik"
        />
        <Input
          id="author"
          disabled={isLoading}
          {...register('author', { required: true })}
          placeholder="Pengarang musik"
        />
        <div>
          <div className="pb-1">
            Unggah musik disini
          </div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept=".mp3"
            {...register('song', { required: true })}
          />
        </div>
        <div>
          <div className="pb-1">
            Unggah cover disini
          </div>
          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register('image', { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit" className="text-white">
          Tambah Musik
        </Button>
      </form>
    </Modal>
  );
}

export default UploadModal;
