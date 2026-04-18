'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useParams, useRouter } from 'next/navigation';
import { GetProductUseCase } from '../../../../application/use-cases/GetProductUseCase';
import { MockProductRepository } from '../../../../infrastructure/repositories/MockProductRepository';
import { Product } from '../../../../domain/entities/Product';
import { FiArrowLeft, FiPackage, FiTag, FiDollarSign, FiBox } from 'react-icons/fi';

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

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.75rem;
  color: var(--text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-2px);
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
`;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      
      const repository = new MockProductRepository();
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
        <BackButton onClick={() => router.back()}>
          <FiArrowLeft size={20} />
        </BackButton>
        <Title>Product Details</Title>
      </Header>

      <Grid>
        <ImageCard>
          {product.imageUrl && product.imageUrl.length > 0 ? (
            <ProductImage src={`/${product.imageUrl[0]}`} alt={product.name} />
          ) : (
            <div style={{ padding: '4rem', color: '#ccc' }}><FiPackage size={48} /></div>
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
            <div style={{ marginTop: '0.5rem' }}>
              <Label>Unit: {product.unitName}</Label>
            </div>
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
              <Label>Product UID</Label>
              <Value style={{ fontSize: '0.8rem', opacity: 0.7 }}>{product.uid}</Value>
            </div>
          </Card>
        </div>
      </Grid>

      <Card style={{ padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>Additional Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <Label>Local Name (TH)</Label>
            <Value>{product.nameTh}</Value>
          </div>
          <div>
            <Label>English Name (EN)</Label>
            <Value>{product.nameEn || '-'}</Value>
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
