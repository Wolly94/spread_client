import { Card, CardActionArea, Grid, Typography } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import {
    GeneralPerk,
    Skill,
    SkilledPerk,
    SkillTree,
} from 'spread_game/dist/skilltree/skilltree'
import MyButton from '../components/MyButton'

interface PerkProps {
    skilledPerk: SkilledPerk
    readonly: boolean
    incLevel: (perk: GeneralPerk) => void
}

const PerkView: React.FC<PerkProps> = (props) => {
    const skilledText =
        props.skilledPerk.level.toString() +
        '/' +
        props.skilledPerk.perk.values.length.toString()
    return (
        <Card>
            <CardActionArea
                onClick={
                    props.readonly
                        ? undefined
                        : () => props.incLevel(props.skilledPerk.perk)
                }
            >
                <Typography variant="h4" component="h5">
                    {props.skilledPerk.perk.name + ' ' + skilledText}
                </Typography>
                <Typography variant="h4" component="h6">
                    {props.skilledPerk.perk.description}
                </Typography>
            </CardActionArea>
        </Card>
    )
}

interface SkillProps {
    skill: Skill
    skilledPerks: SkilledPerk[]
    readonly: boolean
    incLevel: (perk: GeneralPerk) => void
}

const SkillView: React.FC<SkillProps> = (props) => {
    return (
        <Grid container>
            <Typography variant="h4" component="h3">
                {props.skill.name}
            </Typography>
            {props.skill.perks.map((p) => {
                const skilled = props.skilledPerks.find(
                    (sp) => sp.perk.name === p.name,
                )
                const level = skilled === undefined ? 0 : skilled.level
                return (
                    <Grid item xs={12}>
                        <PerkView
                            skilledPerk={{ level: level, perk: p }}
                            readonly={props.readonly}
                            incLevel={props.incLevel}
                        ></PerkView>
                    </Grid>
                )
            })}
        </Grid>
    )
}

interface SkillTreeProps {
    skillTree: SkillTree
    skilledPerks: SkilledPerk[]
    readonly: boolean
    playerName: string
    save: (skilledPerks: SkilledPerk[]) => void
}

const SkillTreeView: React.FC<SkillTreeProps> = (props) => {
    const [newSkilledPerks, setNewSkilledPerks] = useState<SkilledPerk[]>([])
    useEffect(() => {
        setNewSkilledPerks(
            props.skilledPerks.map((sp) => {
                return { ...sp }
            }),
        )
    }, [props.skilledPerks])

    const incLevel = useCallback(
        (perk: GeneralPerk) => {
            let updated = false
            const res = newSkilledPerks.map((sp) => {
                if (sp.perk.name === perk.name) {
                    updated = true
                    const maxLevel = sp.perk.values.length
                    return {
                        perk: sp.perk,
                        level: sp.level === maxLevel ? 0 : sp.level + 1,
                    }
                }
                return sp
            })
            if (!updated) {
                res.push({ level: 1, perk: perk })
            }
            setNewSkilledPerks(res)
        },
        [newSkilledPerks],
    )

    return (
        <Grid container>
            <Typography variant="h4" component="h2">
                {(props.readonly ? 'Watch Skilltree' : 'Modify Skilltree') +
                    ' of Player ' +
                    props.playerName}
            </Typography>
            {!props.readonly && (
                <Grid item>
                    <MyButton onClick={() => props.save(newSkilledPerks)}>
                        Save
                    </MyButton>
                </Grid>
            )}
            {props.skillTree.skills.map((sk) => {
                return (
                    <Grid item xs={12}>
                        <SkillView
                            skill={sk}
                            skilledPerks={newSkilledPerks}
                            readonly={props.readonly}
                            incLevel={incLevel}
                        ></SkillView>
                    </Grid>
                )
            })}
        </Grid>
    )
}

export default SkillTreeView
