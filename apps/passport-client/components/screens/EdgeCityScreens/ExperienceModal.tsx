import { EdDSATicketPCD } from "@pcd/eddsa-ticket-pcd";
import _ from "lodash";
import styled from "styled-components";
import { AdhocModal } from "../../modals/AdhocModal";
import { PCDCard } from "../../shared/PCDCard";

export function ExperienceModal({
  pcd,
  color,
  onClose
}: {
  pcd: EdDSATicketPCD;
  color;
  onClose: () => void;
}): JSX.Element {
  return (
    <AdhocModal
      open={!!pcd}
      onClose={onClose}
      center
      styles={{
        modal: {
          maxWidth: "400px"
        }
      }}
    >
      <Container index={0} count={1} color={color}>
        <PCDCard pcd={pcd} expanded hideRemoveButton />
      </Container>
    </AdhocModal>
  );
}

const Container = styled.div<{ index: number; count: number; color: string }>`
  padding: 16px;

  display: flex;
  gap: 4px;
  align-items: stretch;
  justify-content: space-around;

  > div > div {
    padding: 0;
    border: 1px solid ${({ color }): string => color};
    box-shadow: ${({ index, count, color }): string => {
      return [..._.range(-1, -index - 1, -1), ..._.range(1, count - index)]
        .map((i) => {
          const offset = i * 2;

          return [
            `${offset}px ${offset}px 2px -1px white`,
            `${offset}px ${offset}px 2px 0 ${color}`
          ];
        })
        .join(", ");
    }};
  }
`;
