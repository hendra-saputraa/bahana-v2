"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import useSubscribeModal from '@/hooks/useSubscribeModal';
import { useUser } from '@/hooks/useUser';
import { postData } from '@/libs/helpers';
import { getStripe } from '@/libs/stripeClient';
import { Price, ProductWithPrice } from '@/types';

import Modal from './Modal';
import Button from './Button';

interface SubscribeModalProps {
  products: ProductWithPrice[];
}

const formatPrice = (price: Price) => {
  const priceString = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency,
    minimumFractionDigits: 0
  }).format((price?.unit_amount || 0) / 100);

  return priceString;
};


const SubscribeModal: React.FC<SubscribeModalProps> = ({
  products
}) => {
  const subscribeModal = useSubscribeModal();
  const { user, isLoading, subscription } = useUser();

  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const onChange = (open: boolean) => {
    if (!open) {
      subscribeModal.onClose();
    }
  }

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) {
      setPriceIdLoading(undefined);
      return toast.error('Anda harus masuk terlebih dahulu!');
    }

    if (subscription) {
      setPriceIdLoading(undefined);
      return toast('Sudah berlangganan.');
    }

    try {
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price }
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      return toast.error((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  let content = (
    <div className="text-center">
      Tidak ada paket langganan.
    </div>
  )

  if (products.length) {
    content = (
      <div>
        {products.map((product) => {
          if (!product.prices?.length) {
            return (
              <div key={product.id}>
                Harga tidak tersedia
              </div>
            );
          }

          return product.prices.map((price) => (
            <Button 
              key={price.id} 
              onClick={() => handleCheckout(price)}
              disabled={isLoading || price.id === priceIdLoading}
              className="mb-4 text-white"
            >
              {`Berlangganan seharga ${formatPrice(price)} / ${price.interval}`}
            </Button>
          ))
        })}
      </div>
    )
  }

  if (subscription) {
    content = (
      <div className="text-center">
        Sudah berlangganan.
      </div>
    )
  }

  return (
    <Modal
      title="Hanya untuk pengguna Sultan"
      description="Unggah musikmu dengan Sultan Bahana! <br /> Belum ada kartu kredit? Gunakan test CC 4242-dst."
      isOpen={subscribeModal.isOpen}
      onChange={onChange}
    >
      {content}
    </Modal>
  );
}

export default SubscribeModal;
