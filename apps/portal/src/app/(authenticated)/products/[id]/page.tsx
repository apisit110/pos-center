'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from '@apisit110/pos-ui';
import { useParams, useRouter } from 'next/navigation';
import { GetProductUseCase } from '../../../../domain/usecases/GetProductUseCase';
import { ApiProductRepository } from '../../../../infrastructure/repositories/ApiProductRepository';
import { Product } from '../../../../domain/entities/Product';
import { FiArrowLeft, FiPackage, FiTag, FiDollarSign, FiBox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;


const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #a5a5a5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--primary), transparent);
    opacity: 0.5;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const Label = styled.div`
  color: var(--text-sub);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const Value = styled.div`
  color: var(--text-main);
  font-size: 1.125rem;
  font-weight: 600;
`;

const Badge = styled.span`
  padding: 0.375rem 1rem;
  border-radius: 2rem;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 500;
  width: fit-content;
`;

const PriceValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-main);
  margin-top: 0.5rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: 1rem;
  background: white;
  padding: 1rem;
`;

const ImageCard = styled(Card)`
  padding: 0;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainImageWrapper = styled.div`
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: white;
  padding: 1rem;
`;

const MainImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid var(--border);
  position: relative;
`;

const ThumbnailList = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding: 2px;
`;

const Thumbnail = styled.div<{ $active: boolean }>`
  min-width: 80px;
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  border: 2px solid ${props => props.$active ? '#ef4444' : 'transparent'};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.$active ? '#ef4444' : '#cbd5e1'};
  }
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  color: #64748b;
  position: absolute;
  
  &:hover {
    background: white;
    color: var(--primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);


  const images = Array.isArray(product?.imageUrl) 
    ? product.imageUrl 
    : product?.imageUrl 
      ? [product.imageUrl] 
      : [];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      const repository = new ApiProductRepository();
      const useCase = new GetProductUseCase(repository);
      const result = await useCase.execute(params.id as string);
      
      setProduct(result);
      setLoading(false);
    };

    fetchProduct();
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div style={{ padding: '2rem', textAlign: 'center' }}>Product not found</div>;

  return (
    <Container>
      <Header>
        <Button variant="secondary" style={{ width: 'auto', padding: '0.75rem' }} onClick={() => router.back()}>
          <FiArrowLeft size={20} />
        </Button>
        <Title>Product Details</Title>
      </Header>

      <Grid>
        <ImageCard>
          <MainImageWrapper>
            {images.length > 0 ? (
              <>
                <MainImage 
                  src={images[activeImageIndex].startsWith('http') ? images[activeImageIndex] : `/${images[activeImageIndex]}`} 
                  alt={product.name} 
                />
                {images.length > 1 && (
                  <>
                    <NavButton 
                      style={{ left: '1rem' }} 
                      onClick={handlePrevImage}
                    >
                      <FiChevronLeft />
                    </NavButton>
                    <NavButton 
                      style={{ right: '1rem' }} 
                      onClick={handleNextImage}
                    >
                      <FiChevronRight />
                    </NavButton>
                  </>
                )}
              </>
            ) : (
              <div style={{ padding: '4rem', color: '#ccc' }}><FiPackage size={48} /></div>
            )}
          </MainImageWrapper>
          
          {images.length > 1 && (
            <ThumbnailContainer>
              <ThumbnailList>
                {images.map((img, idx) => (
                  <Thumbnail 
                    key={idx} 
                    $active={activeImageIndex === idx}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <ThumbnailImg 
                      src={img.startsWith('http') ? img : `/${img}`} 
                      alt={`${product.name} ${idx + 1}`} 
                    />
                  </Thumbnail>
                ))}
              </ThumbnailList>
            </ThumbnailContainer>
          )}
        </ImageCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <InfoRow>
              <IconWrapper><FiTag /></IconWrapper>
              <div>
                <Label>Product Name</Label>
                <Value>{product.name}</Value>
              </div>
            </InfoRow>
            <div style={{ marginTop: '1rem' }}>
              <Label>Brand</Label>
              <Badge>{product.brand}</Badge>
            </div>
          </Card>

          <Card>
            <InfoRow>
              <IconWrapper><FiDollarSign /></IconWrapper>
              <div>
                <Label>Base Price</Label>
                <PriceValue>{product.basePrice.toLocaleString()} ฿</PriceValue>
              </div>
            </InfoRow>
          </Card>

          <Card>
            <InfoRow>
              <IconWrapper><FiBox /></IconWrapper>
              <div>
                <Label>Barcode</Label>
                <Value style={{ fontFamily: 'monospace' }}>{product.barcode}</Value>
              </div>
            </InfoRow>
            <div style={{ marginTop: '1rem' }}>
              <Label>Product SKU</Label>
              <Value style={{ fontSize: '0.8rem', opacity: 0.7 }}>{product.sku}</Value>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
            </div>
          </Card>
        </div>
      </Grid>

      <Card style={{ padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>Additional Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <Label>Merchant MID</Label>
            <Value>{product.mid}</Value>
          </div>
          <div>
            <Label>SKU</Label>
            <Value>{product.sku}</Value>
          </div>
          <div>
            <Label>Company</Label>
            <Value>N/A</Value>
          </div>
          <div>
            <Label>Status</Label>
            <Value style={{ color: '#10b981' }}>Active</Value>
          </div>
        </div>
      </Card>
    </Container>
  );
}
