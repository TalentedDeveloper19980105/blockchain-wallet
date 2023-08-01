// eslint-disable-next-line
import { MockSigner, MockUnhashedOrder } from './__mocks__'
import { ERC721Schema, schemaMap } from './schemas'
import { FunctionInputKind } from './types'
import { _encodeBuy, _encodeReplacementPattern, _encodeSell, _getOrderHash } from './wyvern.utils'
import { WYVERN_MERKLE_VALIDATOR_MAINNET } from './constants'

describe('nft utils', () => {
  describe('_getOrderHash', () => {
    it('should return the correct order hash', async () => {
      const orderHash = await _getOrderHash(MockUnhashedOrder, MockSigner)
      expect(orderHash).toBe('0xc4c404ee523f089a37d48d830ebbcbdef1d9f20d5785043562ed5008e592733f')
    })
  })

  describe('_encodeBuy', () => {
    describe('ERC721', () => {
      it('should return correct calldata, replacement pattern, and target', () => {
        const result = _encodeBuy(
          ERC721Schema,
          { address: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b', id: '18279' },
          '0x489B25a2a976dcfC3314b2E1175881353be19d99',
          WYVERN_MERKLE_VALIDATOR_MAINNET
        )

        expect(result.calldata).toBe(
          '0xfb16a5950000000000000000000000000000000000000000000000000000000000000000000000000000000000000000489b25a2a976dcfc3314b2e1175881353be19d9900000000000000000000000049cf6f5d44e70224e2e23fdcdd2c053f30ada28b0000000000000000000000000000000000000000000000000000000000004767000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000'
        )
        expect(result.replacementPattern).toBe(
          '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        )
        expect(result.target).toBe('0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7')
      })
    })
    describe('ERC1155', () => {
      it('should return correct calldata, replacement pattern, and target', () => {
        const result = _encodeBuy(
          schemaMap.ERC1155,
          {
            address: '0x495f947276749ce646f68ac8c248420045cb7b5e',
            id: '77382367877811693003561813400985465590036780249089734465838217365134426243073'
          },
          '0x489B25a2a976dcfC3314b2E1175881353be19d99',
          WYVERN_MERKLE_VALIDATOR_MAINNET
        )

        expect(result.calldata).toBe(
          '0x96809f900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000489b25a2a976dcfc3314b2e1175881353be19d99000000000000000000000000495f947276749ce646f68ac8c248420045cb7b5eab14de3cdf115ded3fcd55ddae3f7a303ef57e3b0000000000006000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000'
        )
        expect(result.replacementPattern).toBe(
          '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        )
        expect(result.target).toBe('0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7')
      })
    })
  })

  it('Should correctly encode replacement patterns for ERC1155 safeTransferFrom function calls.', () => {
    const correctSalePattern =
      '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    const encodeReplacementPatternOutput = _encodeReplacementPattern(
      schemaMap.ERC1155.functions.transfer({
        address: '0x0000000000000000000000000000000000000000',
        id: '71233828018837041171392158059738422347218967485013419437723375284353941635073',
        quantity: '1'
      }),
      FunctionInputKind.Replaceable,
      true
    )
    expect(encodeReplacementPatternOutput).toBe(correctSalePattern)
  })

  it('Should correctly encode calldata for an ERC1155 safeTransferFrom function call.', () => {
    const correctCallData =
      '0xf242432a0000000000000000000000009e38f81217f693367f03e7bbd583fdea1ee297e300000000000000000000000000000000000000000000000000000000000000009d7ceafa3eab6d1ffd5fd95801f106f7d19167e80000000000003e0000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000'
    const encodeSellOrderOutput = _encodeSell(
      schemaMap.ERC1155,
      {
        address: '0x495f947276749ce646f68ac8c248420045cb7b5e',
        id: '71233828018837041171392158059738422347218967485013419437723375284353941635073'
      },
      '0x9e38F81217F693367F03e7bbd583fDEA1eE297E3'
    )
    expect(encodeSellOrderOutput.calldata).toBe(correctCallData)
  })
})
