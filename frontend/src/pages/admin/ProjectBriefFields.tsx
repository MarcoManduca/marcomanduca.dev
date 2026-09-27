import { BilingualFields } from '@/components/admin/BilingualFields'
import type { QuestBrief } from '@/types'

interface ProjectBriefFieldsProps {
  brief?: QuestBrief
}

/** Objective, final boss and rewards: the project told as a quest. */
export const ProjectBriefFields = ({ brief }: ProjectBriefFieldsProps) => (
  <>
    <BilingualFields
      name="briefObjective"
      rows={2}
      defaultValue={brief?.objective}
    />
    <BilingualFields name="briefBoss" rows={2} defaultValue={brief?.boss} />
    <BilingualFields
      name="briefRewards"
      rows={2}
      defaultValue={brief?.rewards}
    />
  </>
)
